"use strict";

/*
_blockUnselectAll
_blockDelete
*/

Object.assign( gsuiGridSamples.prototype, {
	_deletionStarted( id ) {
		this._deletionObj = id ? {} : this._blockUnselectAll( {} );
		id && this._deletionPush( id );
	},
	_deletionPush( id ) {
		if ( id ) { // ???
			this._deletionObj[ id ] = null;
			this._blockDelete( id );
		}
	},
	_deletionEnd() {
		if ( this._deletionObj ) {
			for ( var k in this._deletionObj ) {
				this.onchange( this._deletionObj );
				break;
			}
			delete this._deletionObj;
		}
	}
} );
