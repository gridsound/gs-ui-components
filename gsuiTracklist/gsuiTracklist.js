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
			[ GSEV_TRACK_RENAME ]: ( d, name ) => GSUdomDispatch( this, GSEV_TRACKLIST_RENAMETRACK, d.$target.dataset.id, name ),
			[ GSEV_TRACK_TOGGLE ]: d => GSUdomDispatch( this, GSEV_TRACKLIST_TOGGLETRACK, d.$target.dataset.id ),
			[ GSEV_TRACK_TOGGLESOLO ]: d => GSUdomDispatch( this, GSEV_TRACKLIST_TOGGLESOLOTRACK, d.$target.dataset.id ),
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
