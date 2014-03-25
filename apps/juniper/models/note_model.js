// ==========================================================================
// Project: Juniper
// Copyright: @2014 Dave Porter
// ==========================================================================
/*globals V */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
V.Note = SC.Record.extend(
/** @scope V.Note.prototype */ {

  primaryKey: 'uniqueID',

  text: SC.Record.attr(String),
  tags: SC.Record.toMany('V.Tag'),
  creationDate: SC.Record.attr(SC.DateTime),
  sortDate: SC.Record.attr(SC.DateTime),

  // A read/write property which updates sortDate whenever it's changed.
  archived: function(key, value) {
    // Getter
    if (value === undefined) {
      return !!this.readAttribute('archived');
    }
    // Setter
    else {
      value = !!value;
      this.beginPropertyChanges();
      this.writeAttribute('archived', value);
      this.writeAttribute('sortDate', V.serverTime());
      this.endPropertyChanges();
      return value;
    }
  }.property().cacheable(),

  // The first bit of text, used for fast processing and display in the note list views.
  truncatedText: function() {
  	return (this.get('text') || '').substr(0, 150)
  }.property('text').cacheable(),

  // This value is get-ed much more often than it changes, so it should be cached on the
  // record itself.
  breviaryMarkup: function() {
    var text = this.get('truncatedText');
    if (!text) return '';

    // Remove empty lines.
    var linesWithBlanks = text.split('\n'),
        lines = [],
        len = linesWithBlanks.length,
        i, k = 0;
    for (i = 0; i < len; i++) {
      if (linesWithBlanks[i] && linesWithBlanks[i].trim()) {
        lines[k] = linesWithBlanks[i];
        k++;
      }
    }

    // Construct markup.
    var ret = V.TITLE_BREVIARY_MARKUP_TEMPLATE.fmt(lines.shift() || '');
    ret += lines.join('<br/>');

    return ret;
  }.property('truncatedText').cacheable(),

  debug_encodedText: function() {
    return (this.get('text') || '').replace(/\n/g, '\\n');
  }.property(),

  // HACK: This is a view-layer property masquerading as a model-layer property (since we don't have
  // arrays of object controllers to keep it on instead). It indicates that the content is being 
  // reordered. The view-layer result is that the corresponding list item view becomes transparent.
  isReindexing: NO

});
