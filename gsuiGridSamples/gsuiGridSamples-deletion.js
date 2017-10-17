"use strict";

/*
_bcUnselectAll
_bcDelete
*/

Object.assign( gsuiGridSamples.prototype, {
	_deletionStarted( id ) {
		this._deletionObj = id ? {} : this._bcUnselectAll();
		id && this._deletionPush( id );
	},
	_deletionPush( id ) {
		if ( id ) { // ???
			this._deletionObj[ id ] = null;
			this._bcDelete( id );
		}
	},
	_deletionEnd() {
		this._callOnchange( this._deletionObj );
		delete this._deletionObj;
	}
} );
