
V.MenuItemView = SC.View.extend(SC.ActionSupport, {
  // Action
  target: 'V.statechart',
  action: null,
  // TODO: Better event handling
  click: function() {
    this.fireAction();
  },
  touchStart: function() {
    return YES;
  },
  touchEnd: function() {
    this.fireAction();
    return YES;
  },

  // Data
  name: null,
  icon: null,
  value: null,

  isSelectedMenuItem: function() {
    return this.get('value') === V.mainViewController.get('selectedMenuItem');
  }.property(),

  // Display  
  classNames: ['juniper-menu-item'],
  displayProperties: ['name', 'icon', 'isSelectedMenuItem'],
  render: function(context) {
    var name = (this.get('name') || '').loc(),
        iconClass = this.get('icon') || '',
        isSelected = this.get('isSelectedMenuItem');
    context.setClass({ 'sel': isSelected });
    context.begin().addClass(['juniper-menu-icon', iconClass]).end();
    context.begin().addClass(['juniper-menu-name']).push(name).end();
    // Cache icon class for later removal.
    this._previousIconClass = iconClass;
  },
  update: function($context) {
    var name = (this.get('name') || '').loc(),
        iconClass = this.get('icon') || '',
        isSelected = this.get('isSelectedMenuItem'),
        $name = $context.find('.juniper-menu-name'),
        $icon = $context.find('.juniper-menu-icon'),
        previousIconClass = this._previousIconClass;
    $context.setClass({ 'sel': isSelected });
    if (previousIconClass) $icon.removeClass(previousIconClass);
    $icon.addClass(iconClass);
    $name.text(name);
    // Cache icon class for later removal.
    this._previousIconClass = previousIconClass;
  }
});
