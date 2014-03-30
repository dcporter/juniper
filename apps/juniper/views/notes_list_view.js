
sc_require('view_statecharts');

V.NotesListView = SC.ScrollView.extend({
  // This property takes us out of touch event hand-holding mode, giving me full control over the events (including
  // responsibility for passing it back to the ScrollView if needed).
  delaysContentTouches: NO,

  // Usually, ScrollView chooses gutter scrollers for mouse devices and overlay scrollers for touch devices. These
  // two properties give us overlay scrollers always.
  verticalOverlay: YES,
  verticalScrollerView: SC.OverlayScrollerView,

  // We mix in the notes list statechart view here. See view_statecharts.js.
  contentView: SC.ListView.extend(V.NotesListViewStatechart, {
    wantsAcceleratedLayer: YES,
    contentBinding: SC.Binding.oneWay('V.notesListViewController.arrangedObjects'),
    textSizeBinding: SC.Binding.oneWay('V.typographyController.textSize'),
    rowHeight: function() {
      switch (this.get('textSize')) {
        case 0: return 84; break;
        case 1: return 84; break;
        case 2: return 100; break;
        case 3: return 120; break;
        case 4: return 130; break;
        default: return 84;
      }
    }.property('textSize').cacheable(),
    exampleView: V.NoteBreviaryView.extend({
      contentDisplayProperties: ['isReindexing'],
      render: function(context) {
        sc_super();
        context.setClass('is-reindexing', this.getPath('content.isReindexing'));
      },
      update: function($context) {
        sc_super();
        $context.setClass({ 'is-reindexing': this.getPath('content.isReindexing') });
      }
    }),

    // ---------------------
    // Internal Support
    //
    // If a note item is dragged within this many pixels of the top or bottom, it triggers scrolling.
    DRAG_SCROLL_MARGIN: 45,
    // Outlets
    spareBreviaryViewOutlet: SC.outlet('parentView.parentView.parentView.spareBreviaryView'),
    wrapperViewOutlet: SC.outlet('parentView.parentView.parentView'),

    // ---------------------
    // Event Handling
    //

    // These events are proxied to our statechart.
    mouseDown: function(evt) {
      return !!this.sendAction('mouseDown', evt);
    },
    mouseDragged: function(evt) {
      return !!this.sendAction('mouseDragged', evt);
    },
    mouseUp: function(evt) {
      return !!this.sendAction('mouseUp', evt);
    },
    touchStart: function(evt) {
      return !!this.sendAction('touchStart', evt);
    },
    touchesDragged: function(evt, touches) {
      return !!this.sendAction('touchesDragged', evt, touches);
    },
    touchEnd: function(evt) {
      return !!this.sendAction('touchEnd', evt);
    },
    touchCancelled: function(evt) {
      return !!this.sendAction('touchCancelled', evt);
    }
  })

});
