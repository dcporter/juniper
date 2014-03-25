
V.TypographyState = SC.State.extend({

  representRoute: 'typography',

  _flags: SC.Object.create({
    title: 'V.Typography',
    localizeTitle: YES,
    selectedMenuItem: V.SELECTED_MENU_ITEM.TYPOGRAPHY
  }),

  enterState: function() {
    V.mainViewController.set('content', this._flags);
    V.mainPage.getPath('mainPane.contentView').sendAction('doViewTypography');
    this.set('location', this.get('representRoute'));
  }
});
