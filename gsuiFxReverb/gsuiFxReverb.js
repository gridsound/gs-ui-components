"use strict";

class gsuiFxReverb extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiFxReverb",
			$tagName: "gsui-fx-reverb",
			$jqueryfy: true,
			$elements: {
				$drySli: "[data-prop='dry'] gsui-slider",
				$wetSli: "[data-prop='wet'] gsui-slider",
				$delSli: "[data-prop='delay'] gsui-slider",
				$decSli: "[data-prop='decay'] gsui-slider",
				$fadeinSli: "[data-prop='fadein'] gsui-slider",
				$dryValue: "[data-prop='dry'] gs-output",
				$wetValue: "[data-prop='wet'] gs-output",
				$delValue: "[data-prop='delay'] gs-output",
				$decValue: "[data-prop='decay'] gs-output",
				$fadeinValue: "[data-prop='fadein'] gs-output",
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
		GSUdomListen( this, {
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( d, val ) => this.#oninputProp( d.$target.parentNode.dataset.prop, val ),
			[ GSEV_SLIDER_CHANGE ]: ( d, val ) => this.$this.$dispatch( GSEV_EFFECT_FX_CHANGEPROP, d.$target.parentNode.dataset.prop, val ),
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
				this.$elements.$beatlines.$setAttr( "timedivision", val );
				this.#updatePxPerBeat();
				this.#updateWetPos();
				break;
			case "dry":
				this.$elements.$dryValue.$text( GSUmathFix( val * 100 ) );
				this.$elements.$drySli.$setAttr( "value", val );
				this.$elements.$graphDry.$css( "opacity", val );
				break;
			case "wet":
				this.$elements.$wetValue.$text( GSUmathFix( val * 100 ) );
				this.$elements.$wetSli.$setAttr( "value", val );
				this.$elements.$graphWet.$css( "opacity", GSUmathEaseOutCirc( val / 10 ) );
				break;
			case "delay":
				this.$elements.$delValue.$text( ( +val ).toFixed( 2 ) );
				this.$elements.$delSli.$setAttr( "value", val );
				this.#updateWetPos();
				break;
			case "decay":
				this.$elements.$decValue.$text( ( +val ).toFixed( 2 ) );
				this.$elements.$decSli.$setAttr( "value", val );
				this.#updateWetPos();
				break;
			case "fadein":
				this.$elements.$fadeinValue.$text( ( +val ).toFixed( 2 ) );
				this.$elements.$fadeinSli.$setAttr( "value", val );
				this.#updateWetPos();
				break;
		}
	}

	// .........................................................................
	$onresize() {
		this.#updatePxPerBeat();
	}
	#oninputProp( prop, val ) {
		this.$this.$setAttr( prop, val ).$dispatch( GSEV_EFFECT_FX_LIVECHANGE, prop, val );
	}

	// .........................................................................
	#updatePxPerBeat() {
		const bPM = this.$this.$getAttr( "timedivision" ).split( "/" )[ 0 ];

		this.$elements.$beatlines.$setAttr( "pxperbeat", this.$elements.$beatlines.$width() / bPM );
	}
	#updateWetPos() {
		const [ delay, decay, fadein ] = this.$this.$getAttr( "delay", "decay", "fadein" );
		const ppb = +this.$elements.$beatlines.$getAttr( "pxperbeat" );
		const graphW = this.$elements.$beatlines.$width();

		this.$elements.$graphWet
			.$left( ( delay * ppb ) / graphW * 100, "%" )
			.$width( ( ( +fadein + +decay ) * ppb ) / graphW * 100, "%" );
		this.$this.$css( "--gsui-fadein-p", fadein / ( +fadein + +decay ) * 100 | 0, "%" );
	}
}

GSUdomDefine( "gsui-fx-reverb", gsuiFxReverb );
