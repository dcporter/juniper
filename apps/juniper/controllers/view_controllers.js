
V.mainViewController = SC.ObjectController.create({
  menuIsOpen: NO,
  isInArchive: function() {
    return this.get('selectedMenuItem') === V.SELECTED_MENU_ITEM.ARCHIVE;
  }.property('selectedMenuItem').cacheable()
});
