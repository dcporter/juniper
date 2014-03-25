
// This is a subclass of DCP.LocalStorageDataSource, which is where all the interesting
// localStorage stuff happens. Here, I've extended it with some funky behavior to create
// the app's initial, default notes and tags. It's extra-funky because I've included the
// ability to update it later, adding or modifying the default notes in a way that will
// apply to existing users of the app without wiping out or otherwise impacting their
// existing notes.

V.LocalStorageDataSource = DCP.LocalStorageDataSource.extend({

	appDomain: 'juniper.data',

  version: '1.0',

  isInitialized: NO,

  init: function() {
    sc_super();
    // Initialize fixtures if needed.
    if (this.get('localStorage').readDefault('version') !== this.get('version')) this._initializeLocalStorage();
    else this.set('isInitialized', YES);
    return this;
  },

  // Version-controlled fixtures (default initial notes and tags).
  _initializeLocalStorage: function() {
    var ls = this.get('localStorage'),
        req;
    this._reqs = [];
    // Note the purposeful, totally hackish use of break-free-switch.
    switch (ls.readDefault('version')) {
      case undefined:
        req = SC.Request.getUrl(static_url('resources/fixtures/fixtures_1_0.json'))
          .json()
          .notify(this, this._initRequestDidFetch)
          .send();
        this._reqs.push(req);
      // case '1.0':
        // When new fixtures arrive, add them here.
    }
  },
  _initRequestDidFetch: function() {
    var allAreReady = YES;
    this._reqs.forEach(function(req) {
      // TODO: test the status like a big boy
      if (req.get('status') - 300 > 0) allAreReady = NO;
    });
    // If everybody's ready, load the results up in order!
    if (allAreReady) {
      var ls = this.get('localStorage'),
          noteIds = this._idsForRecordType(V.Note),
          tagIds = this._idsForRecordType(V.Tag);
      this._reqs.forEach(function(req) {
        // Unpack the response.
        var body = req.get('body') || {},
            notes = body['note_set'],
            tags = body['tag_set'];
        // Load notes.
        if (notes) {
          notes.forEach(function(data) {
            ls.writeDefault(this._idKeyForIdAndRecordType(data['uniqueID'], V.Note), data);
            noteIds.push(data['uniqueID']);
          }, this);
        }
        // Load tags.
        if (tags) {
          tags.forEach(function(data) {
            ls.writeDefault(this._idKeyForIdAndRecordType(data['uniqueID'], V.Tag), data);
            tagIds.push(data['uniqueID']);
          }, this);
        }
      }, this);
      this._idsForRecordType(V.Note, noteIds);
      this._idsForRecordType(V.Tag, tagIds);
      ls.writeDefault('version', this.get('version'));
      this.set('isInitialized', YES);
    }
  }
});
