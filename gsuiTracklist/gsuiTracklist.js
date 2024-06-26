"use strict";

class gsuiTracklist extends gsui0ne {
	#tracks = new Map();

	constructor() {
		super( {
			$cmpName: "gsuiTracklist",
			$tagName: "gsui-tracklist",
		} );
		Object.seal( this );
		GSUlistenEvents( this, {
			gsuiTrack: {
				rename: ( d, tr ) => this.$dispatch( "renameTrack", tr.dataset.id, d.args[ 0 ] ),
				toggle: ( d, tr ) => this.$dispatch( "toggleTrack", tr.dataset.id ),
				toggleSolo: ( d, tr ) => this.$dispatch( "toggleSoloTrack", tr.dataset.id ),
			},
		} );
	}

	// .........................................................................
	$getTrack( id ) {
		return this.#tracks.get( id );
	}
	$addTrack( id ) {
		const tr = GSUcreateElement( "gsui-track", { "data-id": id } );

		tr.rowElement.dataset.id = id;
		this.#tracks.set( id, tr );
		this.append( tr );
		return tr;
	}
	$removeTrack( id ) {
		const tr = this.#tracks.get( id );

		tr.remove();
		tr.rowElement.remove();
		this.#tracks.delete( id );
	}
}

GSUdefineElement( "gsui-tracklist", gsuiTracklist );
