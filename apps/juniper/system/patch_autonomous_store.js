
// Some framework patches. This is to enable some important nested store behavior; see
// https://github.com/sproutcore/sproutcore/pull/1000 for discussion, and
// https://gist.github.com/dcporter/6252185 for a gist of this patch.

// SC.Store (for autonomous nested stores)
SC.Store.reopen({
  chainAutonomousStore: function(attrs, newStoreClass) {
    var newAttrs = attrs ? SC.clone( attrs ) : {};
    var source  = this._getDataSource();
 
    newAttrs.dataSource = source;
    return this.chain( newAttrs, newStoreClass );
  }
});
 
// SC.NestedStore (for autonomous nested stores)
SC.NestedStore.reopen({
  chainAutonomousStore: function(attrs, newStoreClass) {
    throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  commitRecords: function(recordTypes, ids, storeKeys) {
    if( this.get( "dataSource" ) )
      return sc_super();
    else
      throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  commitRecord: function(recordType, id, storeKey) {
    if( this.get( "dataSource" ) )
      return sc_super();
    else
      throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  cancelRecords: function(recordTypes, ids, storeKeys) {
    if( this.get( "dataSource" ) )
      return sc_super();
    else
      throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  cancelRecord: function(recordType, id, storeKey) {
    if( this.get( "dataSource" ) )
      return sc_super();
    else
      throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  dataSourceDidCancel: function(storeKey) {
    if( this.get( "dataSource" ) )
      return sc_super();
    else
      throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  dataSourceDidComplete: function(storeKey, dataHash, newId) {
    if( this.get( "dataSource" ) )
      return sc_super();
    else
      throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  dataSourceDidDestroy: function(storeKey) {
    if( this.get( "dataSource" ) )
      return sc_super();
    else
      throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  dataSourceDidError: function(storeKey, error) {
    if( this.get( "dataSource" ) )
      return sc_super();
    else
      throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  pushRetrieve: function(recordType, id, dataHash, storeKey) {
    if( this.get( "dataSource" ) )
      return sc_super();
    else
      throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  pushDestroy: function(recordType, id, storeKey) {
    if( this.get( "dataSource" ) )
      return sc_super();
    else
      throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  pushError: function(recordType, id, error, storeKey) {
    if( this.get( "dataSource" ) )
      return sc_super();
    else
      throw SC.Store.NESTED_STORE_UNSUPPORTED_ERROR;
  },
  
  /**
    Propagate this store's successful changes to its parent (if exists). At the end, it clears the
    local, private status of the committed records therefore the method can be called several times
    until the full transaction is successful or editing is abandoned
 
    @param {Boolean} force if YES, does not check for conflicts first
    @returns {SC.Store} receiver
  */
  commitSuccessfulChanges: function(force) {
    if (this.get('hasChanges') && this.chainedChanges) {
      var chainedChanges = this.chainedChanges,
          dataHashes = this.dataHashes,
          revisions  = this.revisions,
          statuses   = this.statuses,
          editables  = this.editables,
          locks      = this.locks;
      var successfulChanges = chainedChanges.filter( function(storeKey) {
        var state = this.readStatus(storeKey);
 
        return state===SC.Record.READY_CLEAN || state===SC.Record.DESTROYED_CLEAN;
      }, this );
      var pstore = this.get('parentStore');
 
      pstore.commitChangesFromNestedStore(this, successfulChanges, force);
 
      // remove the local status so these records that have been successfully committed on the server
      // are no longer retrieved from this nested store but from the parent
      successfulChanges.forEach(function(storeKey)
      {
        if (dataHashes && dataHashes.hasOwnProperty(storeKey))
          delete dataHashes[storeKey];
        if (revisions && revisions.hasOwnProperty(storeKey))
          delete revisions[storeKey];
        if (editables) delete editables[storeKey];
        if (locks) delete locks[storeKey];
        if (statuses && statuses.hasOwnProperty(storeKey))
          delete statuses[storeKey];
        chainedChanges.remove( storeKey );
      }, this );
 
    }
 
    return this;
  }
  
});
