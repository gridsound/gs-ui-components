"use strict";

class gsuiLibraries extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiLibraries",
			$tagName: "gsui-libraries",
			$jqueryfy: true,
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
		this.$elements.$libBtns.$on( "click", this.#onclickBtns.bind( this ) );
		this.$elements.$libDef.$get( 0 ).$setPlaceholder( "loading..." );
		this.$elements.$libLoc.$get( 0 ).$setPlaceholder( "drag'n drop your own samples in the app, they will appear here" );
	}

	// .........................................................................
	$getLibrary( lib ) {
		return ( lib === "local" ? this.$elements.$libLoc : this.$elements.$libDef ).$get( 0 );
	}

	// .........................................................................
	#onclickBtns( e ) {
		if ( e.target.dataset.lib ) {
			this.$this.$attr( "lib", e.target.dataset.lib );
		}
	}
}

GSUdomDefine( "gsui-libraries", gsuiLibraries );
