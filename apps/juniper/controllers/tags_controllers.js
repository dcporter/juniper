
// The alphabetical list of tags found on active notes.
V.activeTagsController = SC.ArrayController.create({
  // Sort.
  orderBy: 'name',

  // NOTE: At present, you have to notifyPropertyChange on content every time it changes.
  allNotes: null,
  allNotesBinding: SC.Binding.oneWay('V.allNotesController.arrangedObjects'),
  content: function() {
    var notes = this.get('allNotes');
    if (!notes) return null;

    // Get the current list of tags on unarchived notes.
    var tags = [],
        len = notes.get('length'),
        tagsForNote,
        note, i, tag, tagLen, k;
    for (i = 0; i < len; i++) {
      note = notes.objectAt(i);
      tagsForNote = note.get('tags');
      tagLen = tagsForNote.get('length');
      for (k = 0; k < tagLen; k++) {
        tag = tagsForNote.objectAt(k);
        if (!tags.contains(tag)) tags.pushObject(tag);
      }
    }

    tags.sort(function(a, b) {
      return a.get('name') < b.get('name') ? 0 : 1;
    })

    return tags;
  }.property().cacheable(),
  
  notifyContentChange: function() {
    this.invokeNext(this._notifyContentChange);
  },
  _notifyContentChange: function() {
    this.notifyPropertyChange('content');
  }
});

// All tags.
V.allTagsController = SC.ArrayController.create({
  orderBy: 'name'
});

// Tags on the currently-active note. (Possibly redundant.)
V.noteTagsViewController = SC.ArrayController.create({
  contentBinding: SC.Binding.oneWay('V.noteViewController.tags')
});

V.tagSearchController = SC.ArrayController.create({
  // The search field. Used by the state to pop up the tag suggestion pane. Set by the button itself
  // on init. This is a hack but is just way easier than reaching into the view tree manually.
  searchField: null,
  // The search itself.
  text: null,
  notIncludingTags: null,
  notIncludingTagsBinding: SC.Binding.oneWay('V.noteViewController.tags'),
  content: function() {
    // GATEKEEP: No text, or only one character.
    var text = (this.get('text') || '').toLowerCase();
    if (text.length < 2) return null;
    // Get the list of tags.
    var notIncludingTags = this.get('notIncludingTags') || [],
        notIncludingTagIDs = notIncludingTags.getEach('id');
    // Set up the query.
    var q = SC.Query.local(V.Tag, {
      conditions: 'id BEGINS_WITH %@ AND NOT (%@ CONTAINS id)',
      parameters: [text, notIncludingTagIDs]
    });
    // Fetch!
    return V.store.find(q);
  }.property('text', 'notIncludingTags').cacheable()
});
