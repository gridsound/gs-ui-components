"use strict";

class gsuiTracklist extends HTMLElement {
	#tracks = new Map();

	constructor() {
		super();
		Object.seal( this );
		GSUI.$listenEvents( this, {
			gsuiTrack: {
				rename: ( d, tr ) => GSUI.$dispatchEvent( this, "gsuiTracklist", "renameTrack", tr.dataset.id, d.args[ 0 ] ),
				toggle: ( d, tr ) => GSUI.$dispatchEvent( this, "gsuiTracklist", "toggleTrack", tr.dataset.id ),
				toggleSolo: ( d, tr ) => GSUI.$dispatchEvent( this, "gsuiTracklist", "toggleSoloTrack", tr.dataset.id ),
			},
		} );
	}

	// .........................................................................
	getTrack( id ) {
		return this.#tracks.get( id );
	}
	addTrack( id ) {
		const tr = GSUI.$createElement( "gsui-track", { "data-id": id } );

		tr.rowElement.dataset.id = id;
		this.#tracks.set( id, tr );
		this.append( tr );
		return tr;
	}
	removeTrack( id ) {
		const tr = this.#tracks.get( id );

		tr.remove();
		tr.rowElement.remove();
		this.#tracks.delete( id );
	}
}

Object.freeze( gsuiTracklist );
customElements.define( "gsui-tracklist", gsuiTracklist );
