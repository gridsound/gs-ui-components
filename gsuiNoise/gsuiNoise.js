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

			GSUdomSetAttr( this, "color", col );
			GSUdomDispatch( this, GSEV_NOISE_CHANGE, "color", col );
		};
		GSUdomListen( this, {
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( d, val ) => {
				this.#setValue( d.$target.dataset.prop, val );
				GSUdomDispatch( this, GSEV_NOISE_INPUT, d.$target.dataset.prop, val );
			},
			[ GSEV_SLIDER_CHANGE ]: ( d, val ) => {
				GSUdomDispatch( this, GSEV_NOISE_CHANGE, d.$target.dataset.prop, val );
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
				GSUdomSetAttr( this.$elements.$sliders.gain, "disabled", val === null );
				GSUdomSetAttr( this.$elements.$sliders.pan, "disabled", val === null );
				GSUdomSetAttr( this.$elements.$colorSelect, "disabled", val === null );
				break;
			case "color":
				this.$elements.$colorTxt.textContent = val;
				this.$elements.$colorSelect.value = val;
				break;
			case "gain":
			case "pan":
				this.#setValue( prop, val );
				GSUdomSetAttr( this.$elements.$sliders[ prop ], "value", val );
				break;
		}
	}

	// .........................................................................
	#setValue( prop, val ) {
		const val2 = Math.round( val * 100 );
		const val3 = prop === "pan"
			? GSUmathSign( val2 )
			: val2;

		this.$elements.$values[ prop ].textContent = `${ val3 }%`;
	}
}

GSUdomDefine( "gsui-noise", gsuiNoise );
