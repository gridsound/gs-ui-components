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
				$colorTxt: ".gsuiNoise-type-txt",
				$colorSelect: ".gsuiNoise-type select",
			},
			$attributes: {
				toggle: false,
				color: "white",
				gain: 0,
				pan: 0,
			},
		} );
		Object.seal( this );
		this.$elements.$colorSelect.onkeydown = GSUnoopFalse;
		this.$elements.$colorSelect.onchange = () => {
			const col = this.$elements.$colorSelect.value;

			GSUsetAttribute( this, "color", col );
			this.$dispatch( "change", "color", col );
		};
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
		return [ "toggle", "color", "gain", "pan" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "toggle":
				GSUsetAttribute( this.$elements.$sliders.gain, "disabled", val === null );
				GSUsetAttribute( this.$elements.$sliders.pan, "disabled", val === null );
				GSUsetAttribute( this.$elements.$colorSelect, "disabled", val === null );
				break;
			case "color":
				this.$elements.$colorTxt.textContent = val;
				this.$elements.$colorSelect.value = val;
				break;
			case "gain":
			case "pan":
				this.#setValue( prop, val );
				GSUsetAttribute( this.$elements.$sliders[ prop ], "value", val );
				break;
		}
	}

	// .........................................................................
	#setValue( prop, val ) {
		const val2 = Math.round( val * 100 );
		const val3 = prop === "pan"
			? GSUsignNum( val2 )
			: val2;

		this.$elements.$values[ prop ].textContent = `${ val3 }%`;
	}
}

GSUdefineElement( "gsui-noise", gsuiNoise );
