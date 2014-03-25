
V.modalsPage = V.modalsPage || SC.Page.create();
V.modalsPage.tagSuggestionPane = SC.PickerPane.extend(V.FadeTransitionFastInSlowOut, {
  acceptsKeyPane: NO,
  layout: { height: 28, width: 0 },
  preferMatrix: [2, 2, 2, 2, 2],
  preferType: SC.PICKER_POINTER,
  classNames: ['juniper-picker-pane', 'juniper-tag-suggestion-menu'],

  // Resize ourselves whenever our content changes size.
  contentViewFrameDidChange: function() {
    this.invokeNext(this._contentViewFrameDidChange);
  }.observes('.contentView.frame'),
  _contentViewFrameDidChange: function() {
    this.adjust('width', this.getPath('contentView.frame.width'));
  },
  didAppendToDocument: function() {
    this.contentViewFrameDidChange();
  },

  contentView: SC.View.extend({
    layout: { top: 0, height: 28, width: 0 }, /* Include height to make this a fixed layout. */
    childViewLayout: SC.View.HORIZONTAL_STACK,
    childViewLayoutOptions: { spacing: 1 },
    content: null,
    contentBinding: SC.Binding.oneWay('V.tagSearchController.arrangedObjects'),
    contentDidChange: function() {
      // GATEKEEP: No tags. (This will leave the last-visible tag list in place as the pane fades out.)
      var tags = this.get('content') || [];
      if (!tags || !tags.get('length')) return;
      // Create or update a button for each tag.
      var tagViews = this.get('childViews'),
          len = tags.get('length'),
          tag, view, i;
      for (i = 0; i < len; i++) {
        tag = tags.objectAt(i);
        view = tagViews.objectAt(i);
        if (!view) {
          view = this.exampleView.create({ content: tag, isFirst: i === 0, isLast: i === len - 1 });
          this.appendChild(view);
        } else {
          view.set('content', tag).set('isFirst', i === 0).set('isLast', i === len - 1).set('isVisible', YES);
        }
      }
      // Hide the rest.
      len = tagViews.get('length');
      for (i; i < len; i++) {
        tagViews.objectAt(i).set('isVisible', NO).set('content', null);
      }
    }.observes('.content.[]'),

    // Kick off some child views for performance's sake.
    init: function() {
      sc_super();
      for (var i = 0; i < 4; i++) {
        view = this.exampleView.create({ isVisible: NO });
      }
      return this;
    },

    exampleView: SC.ButtonView.extend(SC.AutoResize, {
      layout: { width: 0 },
      classNames: ['juniper-button', 'juniper-tag-suggestion-button'],
      isFirst: NO,
      isLast: NO,
      classNameBindings: ['isFirst:first', 'isLast:last'],
      content: null,
      titleBinding: SC.Binding.oneWay('*content.name'),
      action: 'doAddTag'
    })
  })
});
