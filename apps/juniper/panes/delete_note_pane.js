

V.modalsPage = V.modalsPage || SC.Page.create();
V.modalsPage.deleteNotePane = SC.PanelPane.extend({
  layout: { height: 89, width: 265, centerX: 0, centerY: -93 },
  classNames: ['juniper-delete-confirm-pane'],

  // TODO: Add this to the frameworks as SC.View.FADE_SCALE_IN.
  transitionIn: {
    layoutProperties: ['opacity', 'scale'],
    setup: function (view, options, inPlace) {
      view.adjust({
        scale: inPlace ? view.get('layout').scale || 1.1 : options.scale || 1.1,
        opacity: inPlace ? view.get('layout').opacity || 0 : 0
      });
    },
    run: function (view, options, finalLayout, finalFrame) {
      view.animate({
        opacity: finalLayout.opacity || 1,
        scale: finalLayout.scale || 1
      }, {
        delay: options.delay || 0,
        duration: options.duration || 0.4,
        timing: options.timing || 'ease'
      }, function (data) {
        if (!data.isCancelled) {
          this.didTransitionIn();
        }
      });
    }
  },
  transitionInOptions: { scale: 1.15, duration: 0.3 },
  transitionOut: SC.View.FADE_OUT,
  transitionOutOptions: { duration: 0.1 },

  modalPane: SC.ModalPane.extend({
    classNames: ['juniper-modal-pane'],
    transitionIn: SC.View.FADE_IN,
    transitionInOptions: { duration: 0.3 },
    transitionOut: SC.View.FADE_OUT,
    transitionOutOptions: { duration: 0.1 },
  }),

  contentView: SC.View.extend({
    childViews: ['deleteButtonView', 'cancelButtonView'],
    deleteButtonView: SC.ButtonView.extend({
      layout: { height: 45, borderBottom: 1 },
      classNames: ['juniper-button', 'juniper-delete-confirm-button'],
      localize: YES,
      title: 'V.DeleteNote.Delete',
      action: 'doDeleteNote'
    }),
    cancelButtonView: SC.ButtonView.extend({
      layout: { height: 44, bottom: 0 },
      classNames: ['juniper-button', 'juniper-delete-cancel-button'],
      localize: YES,
      title: 'V.DeleteNote.Cancel',
      action: 'doCancelDeleteNote'
    })
  })
});
