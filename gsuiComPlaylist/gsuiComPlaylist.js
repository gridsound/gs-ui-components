"use strict";

class gsuiComPlaylist extends gsui0ne {
	#cmps = new Map();

	constructor() {
		super( {
			$cmpName: "gsuiComPlaylist",
			$tagName: "gsui-com-playlist",
			$elements: {
				$headLinkCmps: ".gsuiComPlaylist-head-btn:first-child",
				$headLinkBin: ".gsuiComPlaylist-head-btn:last-child",
				$listCmps: ".gsuiComPlaylist-list[data-list=cmps]",
				$listBin: ".gsuiComPlaylist-list[data-list=bin]",
			},
		} );
		Object.seal( this );
		this.#setNbCmps( 0 );
		this.#setNbBin( 0 );
		this.$elements.$headLinkCmps.onclick = () => GSUsetAttribute( this, "bin", false );
		this.$elements.$headLinkBin.onclick = () => GSUsetAttribute( this, "bin", true );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "itsme" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "itsme": val !== "" && GSUsetAttribute( this, "bin", false ); break;
		}
	}

	// .........................................................................
	$clearCompositions() {
		GSUemptyElement( this.$elements.$listCmps );
		GSUemptyElement( this.$elements.$listBin );
		this.#setNbCmps( 0 );
		this.#setNbBin( 0 );
	}
	$changeCompositionProp( id, prop, val ) {
		GSUsetAttribute( this.#cmps.get( id ), prop, val );
	}
	$addCompositions( arr ) {
	}
	$addCompositionsBin( arr ) {
	}

	// .........................................................................
	#setNbCmps( n ) { this.$elements.$headLinkCmps.firstChild.textContent = n; }
	#setNbBin( n ) { this.$elements.$headLinkBin.firstChild.textContent = n; }
}

GSUdefineElement( "gsui-com-playlist", gsuiComPlaylist );
