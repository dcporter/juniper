
V.CreditsState = SC.State.extend({

  representRoute: 'credits',

  _flags: SC.Object.create({
    title: 'V.Credits',
    localizeTitle: YES,
    selectedMenuItem: V.SELECTED_MENU_ITEM.CREDITS
  }),
  
  enterState: function() {
    V.mainViewController.set('content', this._flags);
    V.mainPage.getPath('mainPane.contentView').sendAction('doViewCredits');
    this.set('location', this.get('representRoute'));
  }
});
