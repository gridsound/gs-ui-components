"use strict";

function gsuiTrackList() {
	var root = this._clone();

	this.data = {};
	this.rootElement = root;
	this._uiTracks = {};
}

gsuiTrackList.prototype = {
	remove() {
		this.empty();
		this.rootElement.remove();
	},
	empty() {
		for ( var id in this._uiTracks ) {
			this._delTrack( id );
		}
	},
	change( objs ) {
		var id, obj, uiTrk,
			rowid = 0,
			arr = [];

		this.newRowElements = [];
		for ( id in objs ) {
			arr.push( { id: id, obj: objs[ id ] } );
		}
		arr.sort( function( a, b ) {
			return a.obj.order > b.obj.order;
		} );
		arr.forEach( function( { id, obj } ) {
			if ( obj ) {
				if ( !this.data[ id ] ) {
					uiTrk = this._newTrack( id );

					// 1. TODO
					uiTrk.rowElement.dataset.rowid = rowid++;
				}
				this._uiTracks[ id ].change( obj );
			} else {
				this._delTrack( id );
			}
		}, this );
	},

	// private:
	_clone() {
		var div = document.createElement( "div" );

		gsuiTrackList.template || this._init();
		div.appendChild( document.importNode( gsuiTrackList.template.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},
	_init() {
		gsuiTrackList.template = document.getElementById( "gsuiTrackList" );
	},
	_newTrack( id ) {
		var uiTrk = new gsuiTrack();

		uiTrk.uiToggle.onmousedownright = this._muteAll.bind( this, id );
		uiTrk.onchange = this._evocTrack.bind( this, id );
		uiTrk.setPlaceholder( "Track " + ( this.rootElement.childNodes.length + 1 ) );
		this.data[ id ] = uiTrk.data;
		this._uiTracks[ id ] = uiTrk;
		this.rootElement.append( uiTrk.rootElement );
		this.newRowElements.push( uiTrk.rowElement );
		return uiTrk;
	},
	_delTrack( id ) {
		this._uiTracks[ id ].remove();
		delete this._uiTracks[ id ];
		delete this.data[ id ];
	},
	_evocTrack( id, obj ) {
		this.onchange( { [ id ]: obj } );
	},
	_muteAll( id ) {
		var _uiTrk, tog,
			obj = {},
			uiTrks = this._uiTracks,
			uiTrk = uiTrks[ id ],
			allMute = true;

		for ( id in uiTrks ) {
			_uiTrk = uiTrks[ id ];
			if ( _uiTrk.data.toggle && _uiTrk !== uiTrk ) {
				allMute = false;
				break;
			}
		}
		for ( id in uiTrks ) {
			_uiTrk = uiTrks[ id ];
			tog = allMute || _uiTrk === uiTrk;
			if ( tog !== _uiTrk.data.toggle ) {
				_uiTrk.toggle( tog );
				obj[ id ] = { toggle: tog };
			}
		}
		this.onchange( obj );
	}
};

/*
1. The `data-rowid` is the index of the row inside each other rows.
	But the `.change()` function doesn't change the id, if the a track is deleted in the middle, etc.
*/
