
V.NotesListState = SC.State.extend({

  representRoute: ':list_id',

  // When called from this state, these queue up their return lists.
  doViewNote: function(sender) {
    var context = {
      content: sender.get('content'),
      fromList: this.get('context')
    };
    this.gotoState('noteState', context);
  },
  doCreateNewNote: function() {
    var currentTag = V.mainViewController.get('tag');
    var context = {
      createNewNote: YES,
      withTags: currentTag ? [currentTag] : null,
      fromList: this.get('context')
    };
    this.gotoState('noteState', context);
  },

  // Sent by the view statechart to indicate that the note view controller can be safely cleared.
  noteIsNoLongerVisible: function() {
    V.noteViewController.set('content', null);
  },

  // Sent by the view statechart during rearranging.
  doReindexContent: function(context) {
    // If the content is moving up the list (newer), its sortDate should be set between idx and idx - 1.
    // If the content is moving down the list (older), its sortDate should be set between idx and idx + 1.
    // If idx ± 1 doesn't exist, just add or subtract a day.
    var idx = context.toIndex,
        indexIsIncreasing = idx > context.fromIndex,
        content = context.content,
        contentCurrentlyAtIndex = V.notesListViewController.objectAt(idx),
        nextContentIndex = indexIsIncreasing ? idx + 1 : idx - 1,
        nextContent = V.notesListViewController.objectAt(nextContentIndex),
        newSortMs, newSortDate;
    if (nextContent) {
      newSortMs = (contentCurrentlyAtIndex.getPath('sortDate.milliseconds') + nextContent.getPath('sortDate.milliseconds')) / 2;
      newSortDate = SC.DateTime.create(newSortMs);
    }
    else {
      newSortDate = contentCurrentlyAtIndex.get('sortDate').advance({ day: (indexIsIncreasing ? -1 : 1) });
    }
    content.set('sortDate', newSortDate);
  },
  doCommitContent: function(context) {
    var content = context.content;
    content.commitRecord();
  },

  // Internal support
  enterStateByRoute: function(context) {
    var tagId = context.params.list_id,
        listController = V.urlSlugToNoteListController(tagId);
    if (!listController) {
      this.gotoState('notesListState');
    }
    else {
      this._enterState(listController);
    }
  },
  enterState: function(context) {
    // If no context is provided, use the All Notes list.
    if (!context) context = V.allNotesController;
    var location = V.noteListControllerToUrlSlug(context);
    this.set('location', location);
    this._enterState(context);
  },
  _enterState: function(context) {
    // Set the context locally.
    this.set('context', context);
    this.contextDidChange(); // The state observer hasn't spun up yet (appropriately).
    // Just to be sure.
    V.mainPage.getPath('mainPane.contentView').sendAction('doViewNotesList');
  },

  context: null,
  contextDidChange: function() {
    // Set the content of the main view controller. Titles, et cetera are bound into
    // the mainPane from here.
    V.mainViewController.set('content', this.getPath('context.flags'));
    // Set the notes list view controller's content to the passed array.
    V.notesListViewController.set('content', this.getPath('context.content'));
  }.stateObserves('*context.content'),

  exitState: function() {
    this.set('context', null);
  }
});
