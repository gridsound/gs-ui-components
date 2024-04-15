"use strict";

class gsuiLibraries extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiLibraries",
			$tagName: "gsui-libraries",
			$elements: {
				$libBtns: ".gsuiLibraries-libBtns",
				$libDef: ".gsuiLibrary-default",
				$libLoc: ".gsuiLibrary-local",
			},
			$attributes: {
				lib: "default",
			},
		} );
		Object.seal( this );
		this.$elements.$libBtns.onclick = gsuiLibraries.#onclickBtns.bind( null, this );
		this.$elements.$libDef.$setPlaceholder( "loading..." );
		this.$elements.$libLoc.$setPlaceholder( "drag'n drop your own samples in the app, they will appear here" );
	}

	// .........................................................................
	$getLibrary( lib ) {
		return lib === "local" ? this.$elements.$libLoc : this.$elements.$libDef;
	}

	// .........................................................................
	static #onclickBtns( root, e ) {
		if ( e.target.dataset.lib ) {
			GSUsetAttribute( root, "lib", e.target.dataset.lib );
		}
	}
}

Object.freeze( gsuiLibraries );
customElements.define( "gsui-libraries", gsuiLibraries );
