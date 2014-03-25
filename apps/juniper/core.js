// ==========================================================================
// Project: Juniper
// Copyright: @2014 Dave Porter
// ==========================================================================
/*globals V */

// This requires in a patch for letting nested stores talk to the data source directly. It's
// a great pattern and I highly recommend it. The code is by SproutCore contributor mirion,
// and is available in a gist at https://gist.github.com/dcporter/6252185.
sc_require('system/patch_autonomous_store');

/** @namespace

  Dave Porter presents Juniper. Inspired by Vesper.

  `core.js` is the first file to load. It defines your application object, and it's a
  good place to store any global convenience methods and constants. If you're
  patching any of your submodules (usually a bad idea, but occasionally convenient),
  you should do it here, before any of your application objects are created.

  @extends SC.Object
*/
V = SC.Application.create(
  /** @scope V.prototype */ {

  NAMESPACE: 'V',
  VERSION: '1.0.0',

  store: SC.Store.create().from('V.LocalStorageDataSource'),

  // In a syncing situation, this would return the best guess server time based on whatever calculations you wanted to make.
  serverTime: function() {
    return (new Date).toISOString()
  },

  // A convenience method for generating a new GUID.
  guid: function() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return ( c === 'x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
  },

  // CONSTANTS

  // Used to indicate which menu item is selected.
  SELECTED_MENU_ITEM: {
    ALL_NOTES: 'all notes',
    TAG: 'tag',
    ARCHIVE: 'archive',
    TYPOGRAPHY: 'typography',
    CREDITS: 'credits'
  },

  // The template for a note's header. (This is a view layer consideration, but for performance reasons we're also using
  // it in the model layer, so it lives here. Note that you will not usually build HTML directly in SproutCore; this is
  // ONLY for use with the WYSIWYG view.)
  TITLE_MARKUP_TEMPLATE: '<div class="juniper-note-text juniper-note-title">%@</div>',
  TITLE_BREVIARY_MARKUP_TEMPLATE: '<span class="juniper-note-text juniper-note-title">%@</span><br>',

  // View transition settings hashes. We could move these into the view layer by playing fragile games with sc_require(),
  // but I like this better.
  FadeTransitionFast: {
    transitionShow: SC.View.FADE_IN,
    transitionShowOptions: { duration: 0.15 },
    transitionHide: SC.View.FADE_OUT,
    transitionHideOptions: { duration: 0.15 }
  },
  // See V.mainPage.STATE_TRANSITION_DURATION
  FadeTransitionSlow: {
    transitionShow: SC.View.FADE_IN,
    transitionShowOptions: { duration: 0.35 },
    transitionHide: SC.View.FADE_OUT,
    transitionHideOptions: { duration: 0.35 }
  },
  FadeTransitionFastInSlowOut: {
    transitionShow: SC.View.FADE_IN,
    transitionShowOptions: { duration: 0.15 },
    transitionHide: SC.View.FADE_OUT,
    transitionHideOptions: { duration: 0.35 }
  },
  SlideFromTopTransitionFast: {
    transitionShow: SC.View.SLIDE_IN,
    transitionShowOptions: { direction: 'down', duration: 0.15 },
    transitionHide: SC.View.SLIDE_OUT,
    transitionHideOptions: { direction: 'up', duration: 0.15 }
  }

});
