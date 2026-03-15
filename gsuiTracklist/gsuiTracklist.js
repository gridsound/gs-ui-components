"use strict";

class gsuiTracklist extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-tracklist",
		} );
		Object.seal( this );
		GSUdomListen( this, {
			[ GSEV_TRACK_RENAME ]: ( d, name ) => this.$this.$dispatch( GSEV_TRACKLIST_RENAMETRACK, d.$targetId, name ),
			[ GSEV_TRACK_TOGGLE ]: d => this.$this.$dispatch( GSEV_TRACKLIST_TOGGLETRACK, d.$targetId ),
			[ GSEV_TRACK_TOGGLESOLO ]: d => this.$this.$dispatch( GSEV_TRACKLIST_TOGGLESOLOTRACK, d.$targetId ),
		} );
	}

	// .........................................................................
	$getTrack( id ) {
		return this.$this.$query( `gsui-track[data-id="${ id }"]` );
	}
	$addTrack( id ) {
		const tr = $( "<gsui-track>" )
			.$setAttr( "data-id", id )
			.$appendTo( this );

		tr.$message( GSEV_TRACK_ROWELEMENT ).$setAttr( "data-id", id );
		return tr;
	}
	$removeTrack( id ) {
		this.$getTrack( id ).$remove().$message( GSEV_TRACK_ROWELEMENT ).$remove();
	}
}

GSUdomDefine( "gsui-tracklist", gsuiTracklist );
