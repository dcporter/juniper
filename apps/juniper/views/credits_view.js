
// A demonstration of SproutCore's weakest feature: generating large plain-HTML views. (Applications by and
// large do not and should not have many of this sort of view.) I've built this one with the low-level render
// API, and with special handling of events from links.

V.CreditsView = SC.View.extend({
  classNames: ['juniper-credits'],
  render: function(context) {

    context.begin().addClass('juniper-credits-tagline').push("V.Credits.Tagline".loc()).end();

    context.begin().addClass('juniper-credits-tag').end();

    context.begin().addClass('juniper-credits-inspired-by').push("V.Credits.InspiredBy".loc()).end();
    context.begin('a').setAttr({ target: '_blank', href: 'http://vesperapp.co', 'data-anchor': YES })
      .addClass('juniper-credits-title').begin().end().end();
    context.begin('a').setAttr({ target: '_blank', href: 'http://vesperapp.co', 'data-anchor': YES })
      .addClass('juniper-credits-production').push("V.Credits.QBranchProduction".loc()).end();

    // TODO: Localize. Or decide not to because it's weird here.
    context.begin().addClass('juniper-credits-sproutcore').push('Built with ')
      .begin('a').setAttr({ target: '_blank', href: 'http://www.sproutcore.com/about', 'data-anchor': YES })
      .addClass('juniper-credits-link').push('SproutCore')
      .end().end();
    context.begin().addClass('juniper-credits-author').push('by ')
      .begin('a').setAttr({ target: '_blank', href: 'http://dcporter.net', 'data-anchor': YES })
      .addClass('juniper-credits-link').push('Dave Porter')
      .end().end();
    context.begin().addClass('juniper-credits-source').push('View the annotated source on ')
      .begin('a').setAttr({ target: '_blank', href: 'https://github.com/dcporter/juniper', 'data-anchor': YES })
      .addClass('juniper-credits-link').push('GitHub')
      .end().push('.').end();

    context.begin().addClass('juniper-credits-copyright').push('Vesper, the tag logo, and this app&#8217;s design copyright Q Branch and used with permission. This app is not affiliated with Q Branch in any way.').end();
  },
  // This just prevents render from being called the old-fashioned way.
  update: function($context) {},

  // Events on links need to be treated differently (reverted to normal web-page behavior, essentially).
  mouseDown: function(evt) {
    if (evt.target.getAttribute('data-anchor')) {
      evt.allowDefault();
      return YES;
    } else {
      return NO;
    }
  },
  mouseUp: function (evt) {
    if (evt.target.getAttribute('data-anchor')) {
      evt.allowDefault();
      return YES;
    } else {
      return NO;
    }
  },
  touchStart: function (touch) {
    if (evt.target.getAttribute('data-anchor')) {
      evt.allowDefault();
      return YES;
    } else {
      return NO;
    }
  },
  touchEnd: function (touch) {
    if (evt.target.getAttribute('data-anchor')) {
      evt.allowDefault();
      return YES;
    } else {
      return NO;
    }
  }
});
