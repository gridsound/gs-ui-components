"use strict";

class gsuiNoise extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiNoise",
			$tagName: "gsui-noise",
			$jqueryfy: true,
			$elements: {
				$values: ".gsuiNoise-value",
				$sliders: "gsui-slider",
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
		this.$elements.$colorSelect.$on( {
			keydown: GSUnoopFalse,
			change: () => {
				const col = this.$elements.$colorSelect.$at( 0 ).value;

				this.$this.$attr( "color", col );
				GSUdomDispatch( this, GSEV_NOISE_CHANGE, "color", col );
			},
		} );
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
				this.$elements.$sliders.$attr( "disabled", val === null );
				this.$elements.$colorSelect.$attr( "disabled", val === null );
				break;
			case "color":
				this.$elements.$colorTxt.$text( val );
				this.$elements.$colorSelect.$at( 0 ).value = val;
				break;
			case "gain":
			case "pan":
				this.#setValue( prop, val );
				this.$elements.$sliders.$filter( `[data-prop="${ prop }"]` ).$attr( "value", val );
				break;
		}
	}

	// .........................................................................
	#setValue( prop, val ) {
		const val2 = Math.round( val * 100 );
		const val3 = prop === "pan"
			? GSUmathSign( val2 )
			: val2;

		this.$elements.$values.$filter( `[data-prop="${ prop }"]` ).$text( `${ val3 }%` );
	}
}

GSUdomDefine( "gsui-noise", gsuiNoise );
