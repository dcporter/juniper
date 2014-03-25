
V.LoadingState = SC.State.extend({

  enterState: function() {
    // Initialize user settings.
    V.typographyController.defaults({
      'juniper.settings:smallCaps': YES,
      'juniper.settings:textSize': 1,
      'juniper.settings:textWeight': V.TEXT_WEIGHT.LIGHT
    });
    // Show the UI.
    V.mainPage.get('loadingPane').append();
  },

  // This supports the funky default note fixtures setup defined in `local_storage_data_source.js`.
  initialSubstate: 'waitingForLocalStorageState',
  waitingForLocalStorageState: SC.State.extend({
    enterState: function() {
      V.store._getDataSource(); // hack
      this.dataSourceInitializedDidChange();
    },
    // This "state observer" (an observer that's only active while in this state) keeps an eye on
    // the data source's isInitialized flag to let us continue into the application once it's
    // initialized. (Note that the flag may be TRUE by the time we arrive in this state, which is
    // why enterState calls this method manually above.)
    dataSourceInitializedDidChange: function() {
      if (V.store.getPath('dataSource.isInitialized')) {
        this.gotoState('loadingDataState');
      }
    }.stateObserves('V.store.dataSource.isInitialized')
  }),
  
  loadingDataState: SC.State.extend({
    enterState: function() {
      V.notesController.set('content', V.store.find(V.Note));
      V.allTagsController.set('content', V.store.find(V.Tag));
    },

    statusesDidChange: function() {
      var notesStatus = V.notesController.get('status'),
          tagsStatus = V.allTagsController.get('status');
      if (notesStatus & SC.Record.READY && tagsStatus & SC.Record.READY) {
        V.statechart.sendEvent('didLoad');
      }
    }.stateObserves('V.notesController.status', 'V.allTagsController.status'),

    didLoad: function() {
      V.statechart.gotoState('readyState');
    },
  }),

  exitState: function() {
    V.mainPage.get('loadingPane').remove();
    V.activeTagsController.notifyContentChange();
  }

});
