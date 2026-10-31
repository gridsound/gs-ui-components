"use strict";

class gsuiTracklist extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-tracklist",
		} );
		this.$listen( {
			[ GSEV_TRACK_RENAME ]: ( d, name ) => this.$dispatch( GSEV_TRACKLIST_RENAMETRACK, d.$targetId, name ),
			[ GSEV_TRACK_TOGGLE ]: d => this.$dispatch( GSEV_TRACKLIST_TOGGLETRACK, d.$targetId ),
			[ GSEV_TRACK_TOGGLESOLO ]: d => this.$dispatch( GSEV_TRACKLIST_TOGGLESOLOTRACK, d.$targetId ),
		} );
	}

	// .........................................................................
	$getTrack( id ) {
		return this.$query( `gsui-track[data-id="${ id }"]` );
	}
	$addTrack( id ) {
		const tr = $( "<gsui-track>" )
			.$dataId( id )
			.$appendTo( this );

		tr.$message( GSEV_TRACK_ROWELEMENT ).$dataId( id );
		return tr;
	}
	$removeTrack( id ) {
		this.$getTrack( id ).$remove().$message( GSEV_TRACK_ROWELEMENT ).$remove();
	}
}

$.$define( "gsui-tracklist", gsuiTracklist );
