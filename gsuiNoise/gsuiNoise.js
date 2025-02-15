"use strict";

class gsuiNoise extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiNoise",
			$tagName: "gsui-noise",
			$elements: {
				$values: {
					gain: ".gsuiNoise-value[data-prop=gain]",
					pan: ".gsuiNoise-value[data-prop=pan]",
				},
				$sliders: {
					gain: "gsui-slider[data-prop=gain]",
					pan: "gsui-slider[data-prop=pan]",
				},
			},
			$attributes: {
				toggle: false,
				gain: 0,
				pan: 0,
			},
		} );
		Object.seal( this );
		GSUlistenEvents( this, {
			gsuiSlider: {
				inputStart: GSUnoop,
				inputEnd: GSUnoop,
				input: ( d, t ) => {
					this.#setValue( t.dataset.prop, d.args[ 0 ] );
					this.$dispatch( "input", t.dataset.prop, d.args[ 0 ] );
				},
				change: ( d, t ) => {
					this.$dispatch( "change", t.dataset.prop, d.args[ 0 ] );
				},
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "toggle", "gain", "pan" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "toggle":
				GSUsetAttribute( this.$elements.$sliders.gain, "disabled", val === null );
				GSUsetAttribute( this.$elements.$sliders.pan, "disabled", val === null );
				break;
			case "gain":
			case "pan":
				this.#setValue( prop, val );
				this.$elements.$sliders[ prop ].$setValue( val );
				break;
		}
	}

	// .........................................................................
	#setValue( prop, val ) {
		const val2 = Math.round( val * 100 );

		this.$elements.$values[ prop ].textContent = prop === "pan"
			? GSUsignNum( val2 )
			: val2;
	}
}

GSUdefineElement( "gsui-noise", gsuiNoise );
