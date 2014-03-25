// ==========================================================================
// Project: Juniper.Tag
// Copyright: @2014 Dave Porter
// ==========================================================================
/*globals V */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
V.Tag = SC.Record.extend(
/** @scope V.Tag.prototype */ {

  primaryKey: 'uniqueID',
  name: SC.Record.attr(String)

});
