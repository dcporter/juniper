
// This state's entry context must have a content (V.Note) and a fromList (the list being viewed). If
// a new note is being created, it must specify createNewNote: YES and may include a list of tags for
// the new note on withTags.

V.NoteState = SC.State.extend({

  representRoute: ':list_id/:note_id',

  // In this state, doGoBack means "go back to the list." We also delete the note if it's empty.
  doGoBack: function() {
    var content = V.noteViewController.get('content');
    // If the note is empty, delete it and return to the list without it.
    var noteText = content.get('text') || '';
    if (!noteText.trim().length) {
      V.statechart.sendAction('doPerformDeleteObject', content);
      V.getPath('mainPage.mainPane.contentView').sendAction('doReturnToList');
    }
    else {
      this.doCommitChanges();
      V.getPath('mainPage.mainPane.contentView').sendAction('doReturnToList', { content: content });
    }
    this.gotoState('notesListState', this._fromList);
  },

  // The share & attachment toolbars
  doToggleAttachmentToolbar: function() {
    V.getPath('mainPage.mainPane.contentView').sendAction('doToggleAttachmentToolbar');
  },
  doToggleShareToolbar: function() {
    V.getPath('mainPage.mainPane.contentView').sendAction('doToggleShareToolbar');
  },
  doHideToolbars: function() {
    V.getPath('mainPage.mainPane.contentView').sendAction('doHideToolbars');
  },

  // Saving
  doCommitChanges: function() {
    // GATEKEEP: No changes.
    if (this._lastSavedText === V.noteViewController.get('text')) {
      this._saveTimer = this.invokeLater(this.doCommitChanges, 500);
      return;
    }
    this._lastSavedText = V.noteViewController.get('text');
    var content = V.noteViewController.get('content');
    if (content) content.commitRecord();
    this._saveTimer = this.invokeLater(this.doCommitChanges, 500);
  },

  // Archiving
  doArchiveNote: function() {
    var note = V.noteViewController.get('content');
    note.set('archived', YES);
    note.commitRecord();
    this.gotoState('notesListState', this._fromList);
    V.getPath('mainPage.mainPane.contentView').sendAction('doReturnToList');
  },
  doUnarchiveNote: function() {
    var note = V.noteViewController.get('content');
    note.set('archived', NO);
    note.commitRecord();
    this.gotoState('notesListState', this._fromList);
    V.getPath('mainPage.mainPane.contentView').sendAction('doReturnToList');
  },

  // Deleting
  doPromptDeleteNote: function() {
    V.getPath('modalsPage.deleteNotePane').append();
  },
  doDeleteNote: function() {
    V.getPath('modalsPage.deleteNotePane').remove();
    var note = V.noteViewController.get('content');
    V.statechart.sendAction('doPerformDeleteObject', note);
    this.gotoState('notesListState', this._fromList);
    V.getPath('mainPage.mainPane.contentView').sendAction('doReturnToList');    
  },
  doCancelDeleteNote: function() {
    V.getPath('modalsPage.deleteNotePane').remove();
  },

  // Creating a new note
  doCreateNewNote: function() {
    var currentTags = V.noteViewController.get('tags');
    var context = {
      createNewNote: YES,
      withTags: currentTags,
      fromList: this._fromList,
      previousNote: V.noteViewController.get('content') // The view statechart uses this to unhide the corresponding list view item.
    };
    this.gotoState('noteState', context);
  },

  // Tags
  doAddTagByName: function(context) {
    // GATEKEEP: No tag, no note.
    var tagName = context.get('value'),
        note = V.noteViewController.get('content');
    if (!tagName || !note) return;
    // See if we have a tag like that already.
    var tagId = tagName.toLowerCase(),
        tags = V.store.find(SC.Query.local(V.Tag, { conditions: 'id = %@', parameters: [tagId] })),
        tag = tags.objectAt(0);
    // If not, create one.
    if (!tag) {
      tag = V.store.createRecord(V.Tag, { name: tagName }, tagId);
      tag.commitRecord();
    }
    // GATEKEEP: If the note already contains the tag.
    var noteTags = note.get('tags');
    if (noteTags.contains(tag)) return;
    // Add the tag to the note.
    noteTags.pushObject(tag);
    note.commitRecord();
    // Notify the tag list... sigh
    V.activeTagsController.notifyContentChange();
  },
  doAddTag: function(context) {
    var tag = context.get('content'),
        note = V.noteViewController.get('content'),
        noteTags = note.get('tags');
    noteTags.pushObject(tag);
    note.commitRecord();
    // Notify the tag list... sigh
    V.activeTagsController.notifyContentChange();
    // Clear the tag search text. (We're assuming that this action is being sent by the popup
    // tag suggester, a kind-of-misplaced but probably-fine assumption.)
    V.tagSearchController.set('text', null);
    V.tagSearchController.get('searchField').discardEditing();
  },
  doShowTagMenu: function(sender) {
    if (V.mainViewController.get('isInArchive')) return;
    V.modalsPage.get('tagMenuPane').set('content', sender.get('content')).popup(sender);
  },
  doRemoveTag: function(context) {
    // GATEKEEP: No note!
    var note = V.noteViewController.get('content');
    if (!note) return;
    // Add the tag to the note and save.
    var tag = context.get('content'),
        tags = note.get('tags');
    tags.removeObject(tag);
    note.commitRecord();
    V.activeTagsController.notifyContentChange();
    V.modalsPage.get('tagMenuPane').remove();
  },
  _tagSearchLengthDidChange: function() {
    var pane = V.modalsPage.get('tagSuggestionPane');
    if (V.tagSearchController.get('length')) {
      if (!pane.get('isAttached')) {
        pane.popup(V.tagSearchController.get('searchField'));
      }
    } else {
      if (pane.get('isAttached')) {
        pane.remove();
      }
    }
  }.stateObserves('V.tagSearchController.length'),

  // Sharing
  doShareNoteByMail: function() {
    // Shut down the share panel.
    V.getPath('mainPage.mainPane.contentView').sendAction('doHideToolbars');
    // Get the text and split it.
    var text = V.noteViewController.get('text');
    if (!text) return;
    var textArray = text.split('\n');
    // Remove blank lines until we get to a not-blank line. That's the subject.
    while (textArray.length && !textArray[0].length) {
      textArray.shift();
    }
    var subject = encodeURIComponent(textArray.shift());
    // Remove blank lines until the next non-blank line. From there down is the body.
    while (textArray.length && !textArray[0].length) {
      textArray.shift();
    }
    text = encodeURIComponent(textArray.join('\n'));
    // Send the mail.
    var href = 'mailto:?subject=%@&body=%@'.fmt(subject, text);
    location.href = href;
  },

  // Internal support
  enterStateByRoute: function(context) {
    // Get the note list.
    var tagId = context.params.list_id,
        listController = V.urlSlugToNoteListController(tagId);
    // GATEKEEP: If there's no list, reenter this state with the All Notes list.
    if (!listController) {
      this.gotoState('noteState', {
        content: context.content,
        fromList: V.allNotesController
      });
      return;
    }
    // Get the note.
    var noteId = context.params.note_id,
        note = V.store.find(V.Note, noteId);
    // GATEKEEP: If there's no note, go back to the list.
    if (!note || !(note.get('status') & SC.Record.READY)) {
      this.gotoState('notesListState', listController);
      return;
    }
    // We got it!
    V.notesListViewController.set('content', listController.get('content'));
    V.mainViewController.set('content', listController.flags);
    this._enterState({
      content: note,
      fromList: listController
    });
  },
  enterState: function(context) {
    var content;
    if (context.createNewNote) {
      var tags = context.withTags || [],
          tagIds = tags.getEach('id'),
          now = V.serverTime();
      content = V.store.createRecord(V.Note, {
        creationDate: now,
        sortDate: now,
        tags: tagIds
      }, V.guid());
    }
    else {
       content = context.content;
    }
    // Set location.
    var noteListSlug = V.noteListControllerToUrlSlug(context.fromList),
        noteId = content.get('id');
    this.set('location', '%@/%@'.fmt(noteListSlug, noteId));
    // Shared setup
    this._enterState({ content: content, fromList: context.fromList });
  },
  _enterState: function(context) {
    V.noteViewController.set('content', context.content);
    this._fromList = context.fromList;
    V.getPath('mainPage.mainPane.contentView').sendAction('doViewNote', context);

    // Set up the save timer.
    this._saveTimer = this.invokeLater(this.doCommitChanges, 500);
    this._lastSavedText = context.content.get('text');

    // Get the tag suggestion pane so that it's ready to go (and be sized) when needed.
    V.modalsPage.get('tagSuggestionPane');
  },
  exitState: function() {
    this._fromList = null;
    if (this._saveTimer) this._saveTimer.invalidate();
    this._saveTimer = null;
    V.getPath('modalsPage.deleteNotePane').remove(); // Just in case. (e.g. routing)
    V.getPath('mainPage.mainPane.contentView').sendAction('doHideToolbars'); // Just in case. (e.g. new note from note)
  }

});
