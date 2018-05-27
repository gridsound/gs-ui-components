"use strict";

class gsuiTrackList {
	constructor() {
		const root = gsuiTrackList.template.cloneNode( true );

		this.rootElement = root;
		this.newRowElements = [];
		this._uiTracks = {};
		this.data = new Proxy( {}, {
			set: this._addTrack.bind( this ),
			deleteProperty: this._delTrack.bind( this )
		} );
	}

	remove() {
		this.empty();
		this.rootElement.remove();
	}
	empty() {
		Object.keys( this._uiTracks ).forEach( id => delete this._uiTracks[ id ] );
	}

	// private:
	_addTrack( tar, id, track ) {
		const uiTrk = new gsuiTrack();

		tar[ id ] = uiTrk.data;
		uiTrk.uiToggle.onmousedownright = this._muteAll.bind( this, id );
		uiTrk.onchange = obj => this.onchange( { [ id ]: obj } );
		uiTrk.setPlaceholder( "Track " + ( this.rootElement.childNodes.length + 1 ) );
		uiTrk.rootElement.dataset.track =
		uiTrk.rowElement.dataset.track = id;
		Object.assign( uiTrk.data, track );
		this._uiTracks[ id ] = uiTrk;
		this.rootElement.append( uiTrk.rootElement );
		this.newRowElements.push( uiTrk.rowElement );
		return true;
	}
	_delTrack( tar, id ) {
		this._uiTracks[ id ].remove();
		delete this._uiTracks[ id ];
		delete tar[ id ];
		return true;
	}
	_muteAll( id ) {
		const uiTrks = this._uiTracks,
			uiTrk = uiTrks[ id ],
			allMute = Object.values( uiTrks ).every( _uiTrk => (
				!_uiTrk.data.toggle || _uiTrk === uiTrk
			) );

		this.onchange( Object.entries( uiTrks ).reduce( ( obj, [ id, _uiTrk ] ) => {
			const toggle = allMute || _uiTrk === uiTrk;

			if ( toggle !== _uiTrk.data.toggle ) {
				obj[ id ] = { toggle };
			}
			return obj;
		}, {} ) );
	}
}

gsuiTrackList.template = document.querySelector( "#gsuiTrackList-template" );
gsuiTrackList.template.remove();
gsuiTrackList.template.removeAttribute( "id" );
