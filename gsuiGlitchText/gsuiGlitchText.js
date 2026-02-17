"use strict";

class gsuiGlitchText extends gsui0ne {
	#text = "";
	#textAlt = [];
	#frameIdOn = null;
	#frameIdOff = null;
	#frameBind = this.#frame.bind( this );
	#unglitchBind = this.#unglitch.bind( this );

	constructor() {
		super( {
			$cmpName: "gsuiGlitchText",
			$tagName: "gsui-glitchtext",
			$elements: {
				$clips: ".gsuiGlitchText-clip",
				$words: ".gsuiGlitchText-word",
			},
		} );
		Object.seal( this );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "enable", "texts" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "enable":
				val === "" ? this.#on() : this.#off();
				break;
			case "texts": {
				const [ text, ...alt ] = val.split( " " );

				this.#text = text;
				this.#textAlt = alt;
			} break;
		}
	}

	// .........................................................................
	#on() {
		if ( !this.#frameIdOn ) {
			this.#frameBind();
		}
	}
	#off() {
		GSUclearTimeout( this.#frameIdOn );
		GSUclearTimeout( this.#frameIdOff );
		this.#frameIdOff =
		this.#frameIdOn = null;
		this.#unglitchBind();
		this.#textContent( "" );
	}
	#frame() {
		this.#glitch();
		this.#frameIdOff = GSUsetTimeout( this.#unglitchBind, .05 + Math.random() * .2 );
		this.#frameIdOn = GSUsetTimeout( this.#frameBind, .25 + Math.random() * .4 );
	}
	#glitch() {
		const clip1 = this.#randDouble( .2 );
		const clip2 = this.#randDouble( .2 );

		this.$elements.$clips.$css( "transform", () => `translate(${ this.#randDouble( .06 ) }em, 0em)` );
		this.$elements.$clips.$at( 0 ).$css( "clipPath", `inset(0 0 ${ .6 + clip1 }em 0)` );
		this.$elements.$clips.$at( 1 ).$css( "clipPath", `inset(${ .4 - clip1 }em 0 ${ .3 - clip2 }em 0)` );
		this.$elements.$clips.$at( 2 ).$css( "clipPath", `inset(${ .7 + clip2 }em 0 -1em 0)` );
		this.#textContent( this.#randText() );
		this.$this.$addClass( "gsuiGlitchText-blended" );
	}
	#unglitch() {
		this.$elements.$clips.$css( {
			clipPath: "",
			transform: "",
		} );
		this.#textContent( this.#text );
		this.$this.$rmClass( "gsuiGlitchText-blended" );
	}

	// .........................................................................
	#randText() {
		const txt = Array.from( this.#text );

		for ( let i = 0; i < 5; ++i ) {
			const ind = this.#randInt( this.#text.length );

			txt[ ind ] = this.#textAlt[ this.#randInt( this.#textAlt.length ) ][ ind ];
		}
		return txt.join( "" );
	}
	#randDouble( d ) {
		return Math.random() * d - d / 2;
	}
	#randInt( n ) {
		return Math.random() * n | 0;
	}
	#textContent( txt ) {
		this.$elements.$words.$text( txt );
	}
}

GSUdomDefine( "gsui-glitchtext", gsuiGlitchText );
