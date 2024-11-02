"use strict";

class gsuiComPlaylist extends gsui0ne {
	#dawURL = "";
	#cmps = new Map();
	#itsMe = false;

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
			case "itsme":
				this.#itsMe = val === "";
				!this.#itsMe && GSUsetAttribute( this, "bin", false );
				break;
		}
	}

	// .........................................................................
	$setDAWURL( url ) {
		this.#dawURL = url;
	}
	$clearCompositions() {
		GSUemptyElement( this.$elements.$listCmps );
		GSUemptyElement( this.$elements.$listBin );
		this.#setNbCmps( 0 );
		this.#setNbBin( 0 );
		this.#cmps.clear();
	}
	$changeCompositionProp( id, prop, val ) {
		GSUsetAttribute( this.#cmps.get( id ), prop, val );
	}
	$addCompositions( arr ) {
		arr.forEach( cmp => {
			const elCmp = this.#createCmp( cmp );

			this.#cmps.set( cmp.id, elCmp );
			( cmp.deleted
				? this.$elements.$listBin
				: this.$elements.$listCmps
			).append( elCmp );
		} );
		this.#setNbCmps( this.$elements.$listCmps.childElementCount );
		this.#setNbBin( this.$elements.$listBin.childElementCount );
	}

	// .........................................................................
	#setNbCmps( n ) { this.$elements.$headLinkCmps.firstChild.textContent = n; }
	#setNbBin( n ) { this.$elements.$headLinkBin.firstChild.textContent = n; }
	#createCmp( cmp ) {
		const id = cmp.id;
		const del = cmp.deleted;

		return GSUcreateElement( "gsui-com-player", {
			"data-id": id,
			link: del ? false : `#/cmp/${ id }`,
			dawlink: del ? false : `${ this.#dawURL }#${ id }`,
			itsmine: this.#itsMe,
			private: !cmp.public,
			opensource: cmp.opensource,
			name: cmp.name,
			bpm: cmp.bpm,
			duration: cmp.duration * 60 / cmp.bpm,
			// actions: !this.#itsMe ? false : del ? "restore" : "fork delete",
		} );
	}
}

GSUdefineElement( "gsui-com-playlist", gsuiComPlaylist );
