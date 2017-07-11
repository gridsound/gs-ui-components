"use strict";

function gsuiTrackList() {
	var root = this._clone();

	this.data = {};
	this.rootElement = root;
	this._uiTracks = {};
	this.tracksNodeList = root.childNodes;
}

gsuiTrackList.prototype = {
	change( objs ) {
		var id, obj, arr = [];

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
					this._newTrack( id );
				}
				this._uiTracks[ id ].change( obj );
			} else {
				this._uiTracks[ id ].remove();
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
		uiTrk.setPlaceholder( "Track " + ( this.tracksNodeList.length + 1 ) );
		this.data[ id ] = uiTrk.data;
		this._uiTracks[ id ] = uiTrk;
		this.rootElement.append( uiTrk.rootElement );
		this.newRowElements.push( uiTrk.rowElement );
	},
	_evocTrack( id, obj ) {
		this.onchange( { [ id ]: obj } );
	},
	_muteAll( id ) {
		var _uiTrk, tog,
			objs = {},
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
				objs[ id ] = { toggle: tog };
			}
		}
		this.onchange( objs );
	}
};
