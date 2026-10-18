"use strict";

class gsuiLibraries extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-libraries",
			$elements: {
				$libBtns: "gsui-libraries-libs",
				$libs: "gsui-library",
			},
			$attributes: {
				lib: "default",
			},
		} );
		this.$elements.$libBtns.$onclick( this.#onclickBtns.bind( this ) );
		this.$elements.$libs.$setAttr( "placeholder", ( _, i ) => !i ? GSTX.$loading : GSTX.$library_placehUser );
	}

	// .........................................................................
	$onmessage( evt, val ) {
		switch ( evt ) {
			case GSEV_LIBRARIES_GET: return this.#getLibrary( val );
		}
	}

	// .........................................................................
	#getLibrary( lib ) {
		return this.$elements.$libs.$filter( `[data-prop="${ lib }"]` );
	}
	#onclickBtns( e ) {
		if ( e.target.dataset.lib ) {
			this.$this.$setAttr( "lib", e.target.dataset.lib );
		}
	}
}

$.$define( "gsui-libraries", gsuiLibraries );
