"use strict";

class gsuiFxReverb extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiFxReverb",
			$tagName: "gsui-fx-reverb",
			$elements: {
				$drySli: "[data-prop='dry'] gsui-slider",
				$wetSli: "[data-prop='wet'] gsui-slider",
				$dryValue: "[data-prop='dry'] .gsuiEffect-param-value",
				$wetValue: "[data-prop='wet'] .gsuiEffect-param-value",
			},
			$attributes: {
				dry: 0,
				wet: 0,
			},
		} );
		Object.seal( this );

		GSUlistenEvents( this, {
			gsuiSlider: {
				inputStart: GSUnoop,
				inputEnd: GSUnoop,
				input: ( d, sli ) => {
					this.#oninputProp( sli.parentNode.dataset.prop, d.args[ 0 ] );
				},
				change: ( d, sli ) => {
					this.$dispatch( "changeProp", sli.parentNode.dataset.prop, d.args[ 0 ] );
				},
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "dry", "wet" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "dry":
				this.$elements.$dryValue.textContent = GSUroundNum( val * 100 );
				GSUsetAttribute( this.$elements.$drySli, "value", val );
				break;
			case "wet":
				this.$elements.$wetValue.textContent = GSUroundNum( val * 100 );
				GSUsetAttribute( this.$elements.$wetSli, "value", val );
				break;
		}
	}

	// .........................................................................
	#oninputProp( prop, val ) {
		GSUsetAttribute( this, prop, val );
		this.$dispatch( "liveChange", prop, val );
	}
}

GSUdefineElement( "gsui-fx-reverb", gsuiFxReverb );
