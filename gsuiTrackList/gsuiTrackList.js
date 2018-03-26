"use strict";

class gsuiTrackList {
	constructor() {
		const root = gsuiTrackList.template.cloneNode( true );

		this.rootElement = root;
		this._uiTracks = {};
		this.data = {};
	}

	remove() {
		this.empty();
		this.rootElement.remove();
	}
	empty() {
		Object.keys( this._uiTracks ).forEach( this._delTrack, this );
	}
	change( objs ) {
		const arr = Object.keys( objs ).map( id => ( { id, obj: objs[ id ] } ) );

		this.newRowElements = [];
		arr.sort( ( a, b ) => a.obj.order > b.obj.order );
		arr.forEach( ( { id, obj } ) => {
			if ( obj ) {
				if ( !this.data[ id ] ) {
					this._newTrack( id );
				}
				Object.assign( this._uiTracks[ id ].data, obj );
			} else {
				this._delTrack( id );
			}
		} );
	}

	// private:
	_newTrack( id ) {
		const uiTrk = new gsuiTrack();

		uiTrk.uiToggle.onmousedownright = this._muteAll.bind( this, id );
		uiTrk.onchange = this._evocTrack.bind( this, id );
		uiTrk.setPlaceholder( "Track " + ( this.rootElement.childNodes.length + 1 ) );
		uiTrk.rootElement.dataset.track =
		uiTrk.rowElement.dataset.track = id;
		this.data[ id ] = uiTrk.data;
		this._uiTracks[ id ] = uiTrk;
		this.rootElement.append( uiTrk.rootElement );
		this.newRowElements.push( uiTrk.rowElement );
	}
	_delTrack( id ) {
		this._uiTracks[ id ].remove();
		delete this._uiTracks[ id ];
		delete this.data[ id ];
	}
	_evocTrack( id, obj ) {
		this.onchange( { [ id ]: obj } );
	}
	_muteAll( id ) {
		const obj = {},
			uiTrks = this._uiTracks,
			uiTrk = uiTrks[ id ],
			allMute = Object.values( uiTrks ).every( _uiTrk => (
				!_uiTrk.data.toggle || _uiTrk === uiTrk
			) );

		Object.entries( uiTrks ).forEach( ( [ id, _uiTrk ] ) => {
			const toggle = allMute || _uiTrk === uiTrk;

			if ( toggle !== _uiTrk.data.toggle ) {
				obj[ id ] = { toggle };
			}
		} );
		this.onchange( obj );
	}
}

gsuiTrackList.template = document.querySelector( "#gsuiTrackList-template" );
gsuiTrackList.template.remove();
gsuiTrackList.template.removeAttribute( "id" );
