
// Convenience functions for turning note list URL slugs into controllers and vice versa.
V.urlSlugToNoteListController = function(slug) {
  var listController;
  if (!slug) {
    listController = V.allNotesController;
  } else if (slug === 'archive') {
    listController = V.archivedNotesController;
  } else {
    slug = (slug || '').replace(/-/g, ' ');
    var tag = V.store.find(V.Tag, slug);
    if (tag && tag.get('status') & SC.Record.READY) {
      listController = V.notesWithTagController.set('tag', tag);
    }
  }
  return listController;
};
V.noteListControllerToUrlSlug = function(controller) {
  var urlSlug;
  if (!controller) urlSlug = '';
  else {
    // Slight hack: if the context's flags object doesn't have a location, it's a tag list and we should snag its id.
    urlSlug = controller.getPath('flags.location');
    if (SC.none(urlSlug)) urlSlug = controller.getPath('tag.id').replace(/ /g, '-');
  }
  return urlSlug;
};

// VIEW CONTROLLERS
V.notesListViewController = SC.ArrayController.create();

V.noteViewController = SC.ObjectController.create({
  // The view never needs to know what the current archive status is; it needs to know
  // how the archive status started out. This prevents a note from flashing italic when
  // the user archives it.
  didStartArchived: null,
  contentDidChange: function() {
    // GATEKEEP: same content.
    var content = this.get('content'),
        priorContent = this._priorContent;
    if (content === priorContent) return;
    this._priorContent = content;
    this.set('didStartArchived', !!this.get('archived'));
  }.observes('content'),

  // Convenience property for whether there's an attachment or not.
  hasAttachment: function() {
    return !!this.getPath('attachments.length')
  }.property('.attachments.length')
});

// DATA CONTROLLERS

// Holds all notes that have loaded into the store. Content is set by the statechart on load.
V.notesController = SC.ArrayController.create();

// Holds all archived notes.
V.archivedNotesController = SC.ArrayController.create({

  flags: SC.Object.create({
    title: 'V.Archive',
    localizeTitle: YES,
    selectedMenuItem: V.SELECTED_MENU_ITEM.ARCHIVE,
    location: 'archive'
  }),

  scope: null,
  scopeBinding: SC.Binding.oneWay('V.notesController.content'),
  content: function() {
    var scope = this.get('scope');
    if (!scope) return null;
    return scope.find(SC.Query.local(V.Note, {
      conditions: 'archived = YES',
      orderBy: 'sortDate DESC'
    }));
  }.property('scope').cacheable()
});

// Holds all un-archived, saved notes.
V.allNotesController = SC.ArrayController.create({

  flags: SC.Object.create({
    title: 'V.AllNotes',
    localizeTitle: YES,
    selectedMenuItem: V.SELECTED_MENU_ITEM.ALL_NOTES,
    location: ''
  }),

  scope: null,
  scopeBinding: SC.Binding.oneWay('V.notesController.content'),
  content: function() {
    var scope = this.get('scope');
    if (!scope) return null;
    return scope.find(SC.Query.local(V.Note, {
      conditions: 'archived != YES AND status != ' + SC.Record.READY_NEW,
      orderBy: 'sortDate DESC'
    }));
  }.property('scope').cacheable()
});

// Holds the notes for the specified tag.
V.notesWithTagController = SC.ArrayController.create({
  // The specified tag. You should only have to set this; everything else is calculated.
  tag: null,
  
  flags: SC.Object.create({
    tag: null,
    tagBinding: SC.Binding.oneWay('V.notesWithTagController.tag'),
    title: null,
    titleBinding: SC.Binding.oneWay('*tag.name'),
    selectedMenuItem: V.SELECTED_MENU_ITEM.TAG
  }),

  // This controller's results should always be scoped within the list of un-archived notes.
  scope: null,
  scopeBinding: SC.Binding.oneWay('V.allNotesController.content'),
  content: function() {
    var scope = this.get('scope'),
        tag = this.get('tag');
    if (!scope || !tag) return null;
    return scope.find(SC.Query.local(V.Note, {
      conditions: 'tags CONTAINS {tag}',
      parameters: {
        tag: this.get('tag')
      },
      orderBy: 'sortDate DESC'
    }));
  }.property('scope', 'tag').cacheable()
})
