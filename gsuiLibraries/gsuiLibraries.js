"use strict";

class gsuiLibraries extends gsui0ne {
	constructor() {
		super( {
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
		this.$elements.$libBtns.$onclick( this.#onclickBtns.bind( this ) );
		this.$elements.$libDef.$setAttr( "placeholder", GSTX.$loading );
		this.$elements.$libLoc.$setAttr( "placeholder", GSTX.$library_placehUser );
	}

	// .........................................................................
	$getLibrary( lib ) {
		return ( lib === "local" ? this.$elements.$libLoc : this.$elements.$libDef ).$get( 0 );
	}

	// .........................................................................
	#onclickBtns( e ) {
		if ( e.target.dataset.lib ) {
			this.$this.$setAttr( "lib", e.target.dataset.lib );
		}
	}
}

$.$define( "gsui-libraries", gsuiLibraries );
