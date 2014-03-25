
V.modalsPage = V.modalsPage || SC.Page.create();
V.modalsPage.tagMenuPane = SC.PickerPane.extend(V.FadeTransitionFast, {
  layout: { width: 102, height: 37 },
  classNames: ['juniper-picker-pane', 'juniper-tag-menu'],
  preferMatrix: [2, 2, 2, 2, 2],
  preferType: SC.PICKER_POINTER,

  // The tag in question. Populated by the state at popup time.
  content: null,

  contentView: SC.View.extend({
    childViews: ['removeButtonView'],
    removeButtonView: SC.ButtonView.extend({
      classNames: ['juniper-button', 'juniper-tag-menu-button'],
      title: 'V.Tag.Remove',
      localize: YES,
      content: null,
      contentBinding: SC.Binding.oneWay('.pane.content'),
      action: 'doRemoveTag'
    })
  })
});
