// ==========================================================================
// Project: Juniper
// Copyright: @2014 My Company, Inc.
// ==========================================================================
/*globals V */

// Constants for V.typographyController.textWeight
V.TEXT_WEIGHT = {
  LIGHT: 'light',
  REGULAR: 'regular'
}

/** @class

  User typography settings are stored here. They are reflected in the app via CSS classes
  applied to the body element.

  This is an instances of `SC.UserDefaults`, SproutCore's excellent but oddly-named
  localStorage wrapper. I've wrapped the applicable properties in setter methods which
  do some basic validation. Each of these has an observer which updates the body element
  with the appropriate CSS class.

  @extends SC.UserDefaults
  @version 1.0
*/

V.typographyController = SC.UserDefaults.create({

  /*
    These two settings provide namespace separation from any other instances of
    `SC.UserDefaults` that may exist in an application. They are prepended to the
    raw key used to store data on the browser's localStorage object.
  */
  appDomain: 'juniper.settings',
  userDomain: 'default',

  /*
    Typography settings
  */

  /* Whether note title lines are small-capped. YES or NO. */
  smallCaps: function(key, value) {
    if (SC.none(value)) return this.readDefault('smallCaps');
    else {
      value = !!value;
      this.writeDefault('smallCaps', value);
    }
  }.property().cacheable(),

  /* The size of the text, from 0 to 4, corresponding to five different font sizes */
  textSize: function(key, value) {
    if (SC.none(value)) return this.readDefault('textSize');
    else {
      value = Math.max(value, 0);
      value = Math.min(value, 4);
      this.writeDefault('textSize', value);
    }
  }.property().cacheable(),

  /* The weight of the text, either V.TEXT_WEIGHT.LIGHT or V.TEXT_WEIGHT.REGULAR */
  textWeight: function(key, value) {
    if (SC.none(value)) return this.readDefault('textWeight');
    else {
      value = value === V.TEXT_WEIGHT.REGULAR ? V.TEXT_WEIGHT.REGULAR : V.TEXT_WEIGHT.LIGHT;
      this.writeDefault('textWeight', value);
    }
  }.property().cacheable(),

  /*
    Internal support
    (A set of property observers which update the corresponding CSS classes on the body element)
  */

  smallCapsDidChange: function() {
    this.$body.setClass({ 'juniper-small-caps': this.get('smallCaps') });
  }.observes('smallCaps'),
  textSizeDidChange: function() {
    var textSize = this.get('textSize'),
        i, className, removeClasses = [];
    for (i = 0; i <= 4; i++) {
      className = 'juniper-text-size-%@'.fmt(i);
      if (i === textSize) this.$body.addClass(className);
      else removeClasses.push(className);
    }
    this.$body.removeClass(removeClasses.join(' '));
  }.observes('textSize'),
  textWeightDidChange: function() {
    var textIsLight = this.get('textWeight') === V.TEXT_WEIGHT.LIGHT;
    this.$body.setClass({ 'juniper-light-text': textIsLight, 'juniper-regular-text': !textIsLight });
  }.observes('textWeight'),

  // Need to do something when the object is first created? Override init. Be sure to call sc_super!
  init: function() {
    sc_super();
    SC.ready(this, function() { this.$body = $('body'); });
    return this;
  }
});
