"use strict";

class gsuiLibraries extends gsui0ne {
	constructor() {
		const ph = {
			default: GSTX.$loading,
			cloud: GSTX.$library_placehCloud,
			local: GSTX.$library_placehUser,
		};

		super( {
			$tagName: "gsui-libraries",
			$elements: {
				$libBtns: "gsui-libraries-libs",
				$libs: "gsui-library",
				$toSelect: "gsui-libraries-libs button, gsui-library",
			},
			$attributes: {
				lib: "default",
			},
		} );
		this.$elements.$libBtns.$onclick( this.#onclickBtns.bind( this ) );
		this.$elements.$libs.$setAttr( "placeholder", el => ph[ $.$dataProp( el ) ] );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "lib" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "lib": this.#onchangeLib( val ); break;
		}
	}
	$onmessage( evt, val ) {
		switch ( evt ) {
			case GSEV_LIBRARIES_GET: return this.#getLibrary( val );
		}
	}

	// .........................................................................
	#getLibrary( lib ) {
		return this.$elements.$libs.$filter( `[data-prop="${ lib }"]` );
	}
	#onchangeLib( lib ) {
		this.$elements.$toSelect.$setAttr( "data-selected", el => lib === $.$dataProp( el ) );
	}
	#onclickBtns( e ) {
		const lib = $.$dataProp( e.target );

		if ( lib ) {
			this.$setAttr( "lib", lib );
		}
	}
}

$.$define( "gsui-libraries", gsuiLibraries );
