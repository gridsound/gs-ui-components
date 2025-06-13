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
				$decSli: "[data-prop='decay'] gsui-slider",
				$fadeinSli: "[data-prop='fadein'] gsui-slider",
				$dryValue: "[data-prop='dry'] .gsuiEffect-param-value",
				$wetValue: "[data-prop='wet'] .gsuiEffect-param-value",
				$delValue: "[data-prop='delay'] .gsuiEffect-param-value",
				$decValue: "[data-prop='decay'] .gsuiEffect-param-value",
				$fadeinValue: "[data-prop='fadein'] .gsuiEffect-param-value",
				$beatlines: "gsui-beatlines",
				$graphDry: ".gsuiFxReverb-graph-dry",
				$graphWet: ".gsuiFxReverb-graph-wet",
			},
			$attributes: {
				dry: 0,
				wet: 0,
				delay: 0,
				decay: 1,
				fadein: 0,
				timedivision: "4/4",
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
	$firstTimeConnected() {
		this.#updatePxPerBeat();
		this.#updateWetPos();
	}
	static get observedAttributes() {
		return [ "timedivision", "dry", "wet", "delay", "decay", "fadein" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "timedivision":
				GSUsetAttribute( this.$elements.$beatlines, "timedivision", val );
				this.#updatePxPerBeat();
				this.#updateWetPos();
				break;
			case "dry":
				this.$elements.$dryValue.textContent = GSUmathFix( val * 100 );
				GSUsetAttribute( this.$elements.$drySli, "value", val );
				this.$elements.$graphDry.style.opacity = val;
				break;
			case "wet":
				this.$elements.$wetValue.textContent = GSUmathFix( val * 100 );
				GSUsetAttribute( this.$elements.$wetSli, "value", val );
				this.$elements.$graphWet.style.opacity = GSUmathEaseOutCirc( val / 10 );
				break;
			case "delay":
				this.$elements.$delValue.textContent = ( +val ).toFixed( 2 );
				GSUsetAttribute( this.$elements.$delSli, "value", val );
				this.#updateWetPos();
				break;
			case "decay":
				this.$elements.$decValue.textContent = ( +val ).toFixed( 2 );
				GSUsetAttribute( this.$elements.$decSli, "value", val );
				this.#updateWetPos();
				break;
			case "fadein":
				this.$elements.$fadeinValue.textContent = ( +val ).toFixed( 2 );
				GSUsetAttribute( this.$elements.$fadeinSli, "value", val );
				this.#updateWetPos();
				break;
		}
	}

	// .........................................................................
	$onresize() {
		this.#updatePxPerBeat();
	}
	#oninputProp( prop, val ) {
		GSUsetAttribute( this, prop, val );
		this.$dispatch( "liveChange", prop, val );
	}

	// .........................................................................
	#updatePxPerBeat() {
		const bPM = GSUdomGetAttr( this, "timedivision" ).split( "/" )[ 0 ];

		GSUsetAttribute( this.$elements.$beatlines, "pxperbeat", this.$elements.$beatlines.clientWidth / bPM );
	}
	#updateWetPos() {
		const delay = GSUdomGetAttrNum( this, "delay" );
		const decay = GSUdomGetAttrNum( this, "decay" );
		const fadein = GSUdomGetAttrNum( this, "fadein" );
		const ppb = GSUdomGetAttrNum( this.$elements.$beatlines, "pxperbeat" );
		const graphW = this.$elements.$beatlines.clientWidth;

		this.$elements.$graphWet.style.left = `${ ( delay * ppb ) / graphW * 100 }%`;
		this.$elements.$graphWet.style.width = `${ ( ( fadein + decay ) * ppb ) / graphW * 100 }%`;
		GSUsetStyle( this, "--gsui-fadein-p", `${ fadein / ( fadein + decay ) * 100 | 0 }%` );
	}
}

GSUdefineElement( "gsui-fx-reverb", gsuiFxReverb );
