
V.ReadyState = SC.State.extend({

  /*
    Actions & Events
  */

  // If this event reaches this state, just pop open the menu. Other states (e.g. noteState)
  // handle this event in their own way, in which case it won't reach this handler.
  doGoBack: function() {
    V.statechart.sendAction('doToggleMenu');
  },

  // Menu Actions
  doOpenMenu: function() {
    V.getPath('mainPage.mainPane.contentView').sendAction('doOpenMenu');
  },
  doCloseMenu: function() {
    V.getPath('mainPage.mainPane.contentView').sendAction('doCloseMenu');
  },
  doToggleMenu: function() {
    V.getPath('mainPage.mainPane.contentView').sendAction('doToggleMenu');
  },

  // App actions
  doViewAllNotes: function() {
    this.gotoState('notesListState');
    V.statechart.sendAction('doCloseMenu');
  },
  doViewNotesWithTag: function(sender) {
    // Get the tag from the sender; set it to the controller and proceed.
    var tag = sender ? sender.get('content') : null;
    if (!tag) return;
    V.notesWithTagController.set('tag', tag);
    this.gotoState('notesListState', V.notesWithTagController);
    V.statechart.sendAction('doCloseMenu');
  },
  doViewArchive: function() {
    this.gotoState('notesListState', V.archivedNotesController);
    V.statechart.sendAction('doCloseMenu');
  },
  doViewTypography: function() {
    this.gotoState('typographyState');
    V.statechart.sendAction('doCloseMenu');
  },
  doViewCredits: function() {
    this.gotoState('creditsState');
    V.statechart.sendAction('doCloseMenu');
  },

  // Deletes an object.
  doPerformDeleteObject: function(object) {
    var storeKey = object.get('storeKey');
    if (object.getPath('store.isNested')) {
      object = V.store.materializeRecord(storeKey);
    }
    object.destroy();
    V.store.commitRecord(null, null, storeKey);
    V.activeTagsController.notifyContentChange(); //sigh
  },

  // Substates
  initialSubstate: 'launchState',

  // The actual initial substate is determined by routing, which is deferred during loading and
  // recommenced in `enterState` below. This empty launchState just gives the statechart a spot
  // to pause while routing recommences.
  launchState: SC.State,
  notesListState: SC.State.plugin('V.NotesListState'),
  noteState: SC.State.plugin('V.NoteState'),
  typographyState: SC.State.plugin('V.TypographyState'),
  creditsState: SC.State.plugin('V.CreditsState'),

  // Internal support
  enterState: function() {
    // Load up the UI.
    V.getPath('mainPage.mainPane').append();
    // Trigger statechart routing, which was deferred up until now.
    V.statechart.set('isReady', YES);
    V.statechart.continueRouting();
  },
  exitState: function() {
    V.getPath('mainPage.mainPane').remove();
  }
});
