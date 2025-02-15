"use strict";

class gsuiNoise extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiNoise",
			$tagName: "gsui-noise",
			$elements: {
				$value: ".gsuiNoise-value",
				$slider: "gsui-slider",
			},
			$attributes: {
				toggle: false,
				value: 0,
			},
		} );
		Object.seal( this );
		GSUlistenEvents( this, {
			gsuiSlider: {
				inputStart: GSUnoop,
				inputEnd: GSUnoop,
				input: d => {
					this.#setValue( d.args[ 0 ] );
					this.$dispatch( "input", d.args[ 0 ] );
				},
				change: d => {
					this.$dispatch( "change", d.args[ 0 ] );
				},
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "toggle", "value" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "toggle":
				GSUsetAttribute( this.$elements.$slider, "disabled", val === null );
				break;
			case "value":
				this.#setValue( val );
				this.$elements.$slider.$setValue( val );
				break;
		}
	}

	// .........................................................................
	#setValue( val ) {
		this.$elements.$value.textContent = Math.round( val * 100 );
	}
}

GSUdefineElement( "gsui-noise", gsuiNoise );
