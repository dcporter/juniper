
V.NoteBreviaryView = SC.View.extend(SC.ContentDisplay, {
  isActive: NO,
  classNameBindings: ['isActive:active'],

  classNames: ['juniper-note-breviary'],

  contentDisplayProperties: ['archived', 'breviaryMarkup'],

  render: function(context) {
    var isArchived = this.getPath('content.archived'),
        markup = this.getPath('content.breviaryMarkup');
    context.setClass({ 'archived': isArchived });
    context = context.begin().addClass('juniper-note-breviary-wrapper juniper-note-text');
      context.push(markup);
    context = context.end();
  },

  update: function($context) {
    var isArchived = this.getPath('content.archived'),
        markup = this.getPath('content.breviaryMarkup');
    $context.setClass({ 'archived': isArchived });
    $context.find('.juniper-note-breviary-wrapper').html(markup);
  }
});
