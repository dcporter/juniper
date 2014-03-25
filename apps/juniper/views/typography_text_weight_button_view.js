

V.TypographyTextWeightButtonView = SC.View.extend({

  // just set the setting value an the button title ahyup
  value: null,

  title: null,

  /*
    Internal support
  */

  // Display
  classNames: ['juniper-text-weight-button'],

  activeTextWeight: null,
  activeTextWeightBinding: SC.Binding.oneWay('V.typographyController.textWeight'),
  isActive: function() {
    return this.get('value') === this.get('activeTextWeight');
  }.property('activeTextWeight').cacheable(),

  classNameBindings: ['isActive:active'],

  render: function(context) {
    var title = (this.get('title') || '').loc();
    context.begin().addClass('juniper-text-weight-button-label juniper-typography-title').push(title).end();
    context.begin().addClass('juniper-text-weight-button-check').end();
  },

  // Action
  action: function() {
    V.typographyController.set('textWeight', this.get('value'));
  },
  click: function() {
    this.action();
    return YES;
  },
  touchStart: function() {
    return YES;
  },
  touchEnd: function() {
    this.action();
    return YES;
  }

});
