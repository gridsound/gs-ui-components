"use strict";

class gsuiFxReverb extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiFxReverb",
			$tagName: "gsui-fx-reverb",
			$elements: {
				$drySli: "[data-prop='dry'] gsui-slider",
				$wetSli: "[data-prop='wet'] gsui-slider",
				$delSli: "[data-prop='delay'] gsui-slider",
				$dryValue: "[data-prop='dry'] .gsuiEffect-param-value",
				$wetValue: "[data-prop='wet'] .gsuiEffect-param-value",
				$delValue: "[data-prop='delay'] .gsuiEffect-param-value",
				$graphDry: ".gsuiFxReverb-graph-dry",
				$graphWet: ".gsuiFxReverb-graph-wet",
			},
			$attributes: {
				dry: 0,
				wet: 0,
				delay: 0,
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
		return [ "dry", "wet", "delay" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "dry":
				this.$elements.$dryValue.textContent = GSUroundNum( val * 100 );
				GSUsetAttribute( this.$elements.$drySli, "value", val );
				this.$elements.$graphDry.style.opacity = val;
				break;
			case "wet":
				this.$elements.$wetValue.textContent = GSUroundNum( val * 100 );
				GSUsetAttribute( this.$elements.$wetSli, "value", val );
				this.$elements.$graphWet.style.opacity = val / 2;
				break;
			case "delay":
				this.$elements.$delValue.textContent = ( +val ).toFixed( 2 );
				GSUsetAttribute( this.$elements.$delSli, "value", val );
				this.$elements.$graphWet.style.left = `${ val * 25 }%`;
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
