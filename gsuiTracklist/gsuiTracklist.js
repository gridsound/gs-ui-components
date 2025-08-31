"use strict";

class gsuiTracklist extends gsui0ne {
	#tracks = new Map();

	constructor() {
		super( {
			$cmpName: "gsuiTracklist",
			$tagName: "gsui-tracklist",
		} );
		Object.seal( this );
		GSUdomListen( this, {
			"gsuiTrack-rename": ( d, name ) => GSUdomDispatch( this, "gsuiTracklist-renameTrack", d.$target.dataset.id, name ),
			"gsuiTrack-toggle": d => GSUdomDispatch( this, "gsuiTracklist-toggleTrack", d.$target.dataset.id ),
			"gsuiTrack-toggleSolo": d => GSUdomDispatch( this, "gsuiTracklist-toggleSoloTrack", d.$target.dataset.id ),
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
