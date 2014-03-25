// ==========================================================================
// Project: Juniper
// Copyright: @2014 Dave Porter
// ==========================================================================
/*globals V */

sc_require('panes/main_pane');

// Note that SC.Page is a class which instantiates views on demand. In general, you will never `create`
// a view. Instead, define your panes within a SC.Page with `extend` or `design`, then be sure to access
// it with `get`. This is a key part of SproutCore's view layer optimizations, and should be considered
// an important best practice.

V.mainPage = SC.Page.create({

  // UI constants.
  MENU_TRANSITION_DURATION: 0.3,
  MENU_CLOSED_OFFSET: -45,
  APP_PANE_OPEN_OFFSET: 282,

  STATE_TRANSITION_DURATION: 0.35,

  unauthenticatedPane: SC.MainPane.extend({
    childViews: ['loginView'],
    loginView: SC.View.extend({
      layout: { height: 225, width: 250, centerX: 0, centerY: 0 },
      childViews: ['usernameView', 'passwordView', 'loginButtonView'],
      usernameView: SC.LabelView.extend({
        layout: { top: 25, left: 10, right: 10, height: 26 },
        value: 'Username goes here'
      }),
      passwordView: SC.LabelView.extend({
        layout: { top: 55, left: 10, right: 10, height: 26 },
        value: 'Password goes here'
      }),
      loginButtonView: SC.ButtonView.extend({
        layout: { bottom: 20, right: 10, width: 80, height: 24 },
        title: 'Log in',
        action: 'doLogIn'
      })
    })
  }),

  authenticatingPane: SC.MainPane.extend({
    childViews: ['labelView'],
    labelView: SC.LabelView.extend({
      classNames: ['welcome-label'],
      layout: { centerX: 0, centerY: 0, width: 300, height: 24 },
      tagName: "h1",
      value: "V.Authenticating",
      localize: YES
    })
  }),

  loadingPane: SC.MainPane.extend({
    childViews: ['headerView', 'bodyView'],
    headerView: SC.View.extend({
      layout: { height: 44 },
      classNames: ['juniper-header-bar']
    }),
    bodyView: SC.View.extend({
      layout: { top: 44 },
      classNames: ['juniper-app-pane'],
    })
  }),

  mainPane: V.MainPane
});
