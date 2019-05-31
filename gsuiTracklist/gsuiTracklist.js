"use strict";

class gsuiTracklist {
	constructor() {
		const root = gsuiTracklist.template.cloneNode( true );

		this.rootElement = root;
		this.onchange =
		this.ontrackadded = () => {};
		this._tracks = new Map();
		this.data = new Proxy( {}, {
			set: this._addTrack.bind( this ),
			deleteProperty: this._delTrack.bind( this )
		} );
		Object.seal( this );
	}

	remove() {
		this.empty();
		this.rootElement.remove();
	}
	empty() {
		Object.keys( this.data ).forEach( id => delete this.data[ id ] );
	}

	// private:
	_addTrack( tar, id, track ) {
		const tr = new gsuiTrack();

		tar[ id ] = tr.data;
		tr.onrightclickToggle = this._muteAll.bind( this, id );
		tr.onchange = obj => this.onchange( { [ id ]: obj } );
		tr.setPlaceholder( `Track ${ this._tracks.size + 1 }` );
		tr.rootElement.dataset.track =
		tr.rowElement.dataset.track = id;
		Object.assign( tr.data, track );
		this._tracks.set( id, tr );
		this.rootElement.append( tr.rootElement );
		this.ontrackadded( tr );
		return true;
	}
	_delTrack( tar, id ) {
		this._tracks.get( id ).remove();
		this._tracks.delete( id );
		delete tar[ id ];
		return true;
	}
	_muteAll( id ) {
		const obj = {},
			trClicked = this._tracks.get( id );
		let allMute = true;

		this._tracks.forEach( tr => {
			allMute = allMute && ( !tr.data.toggle || tr === trClicked );
		} );
		this._tracks.forEach( ( tr, id ) => {
			const toggle = allMute || tr === trClicked;

			if ( toggle !== tr.data.toggle ) {
				obj[ id ] = { toggle };
			}
		} );
		this.onchange( obj );
	}
}

gsuiTracklist.template = document.querySelector( "#gsuiTracklist-template" );
gsuiTracklist.template.remove();
gsuiTracklist.template.removeAttribute( "id" );
