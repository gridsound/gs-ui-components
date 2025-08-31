"use strict";

class gsuiFxFilter extends gsui0ne {
	$askData = GSUnoop;
	#nyquist = 24000;
	#currType = "lowpass";
	#fnValue = {
		Q: a => a,
		gain: a => a,
		detune: a => a,
		frequency: a => GSUXtoHz( a ) * this.#nyquist,
	};
	static typeGainQ = {
		lowpass:   { gain: false, q: true },
		highpass:  { gain: false, q: true },
		bandpass:  { gain: false, q: true },
		lowshelf:  { gain: true,  q: false },
		highshelf: { gain: true,  q: false },
		peaking:   { gain: true,  q: true },
		notch:     { gain: false, q: true },
		allpass:   { gain: false, q: true },
	};

	constructor() {
		super( {
			$cmpName: "gsuiFxFilter",
			$tagName: "gsui-fx-filter",
			$elements: {
				$type: ".gsuiFxFilter-areaType .gsuiFxFilter-area-content",
				$graph: ".gsuiFxFilter-areaGraph .gsuiFxFilter-area-content",
				$curves: "gsui-curves",
				$sliders: {
					q: ".gsuiFxFilter-areaQ gsui-slider",
					gain: ".gsuiFxFilter-areaGain gsui-slider",
					detune: ".gsuiFxFilter-areaDetune gsui-slider",
					frequency: ".gsuiFxFilter-areaFrequency gsui-slider",
				},
			},
		} );
		Object.seal( this );
		this.$elements.$type.onclick = this.#onclickType.bind( this );
		GSUdomListen( this, {
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( d, val ) => this.#oninputProp( d.$target.dataset.prop, this.#fnValue[ d.$target.dataset.prop ]( val ) ),
			[ GSEV_SLIDER_CHANGE ]: ( d, val ) => GSUdomDispatch( this, GSEV_EFFECT_FX_CHANGEPROP, d.$target.dataset.prop, this.#fnValue[ d.$target.dataset.prop ]( val ) ),
		} );
		this.$elements.$graph.append( this.$elements.$curves );
	}

	// .........................................................................
	$connected() {
		this.#updateWave();
	}
	static get observedAttributes() {
		return [ "type", "frequency", "q", "gain", "detune", "off" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "type":
				this.#toggleTypeBtn( this.#currType, false );
				this.#toggleTypeBtn( val, true );
				this.#currType = val;
				GSUdomSetAttr( this.$elements.$sliders.q, "disabled", !gsuiFxFilter.typeGainQ[ val ].q );
				GSUdomSetAttr( this.$elements.$sliders.gain, "disabled", !gsuiFxFilter.typeGainQ[ val ].gain );
				break;
			case "q":
			case "gain":
			case "detune":
				GSUdomSetAttr( this.$elements.$sliders[ prop ], "value", val );
				break;
			case "frequency":
				GSUdomSetAttr( this.$elements.$sliders.frequency, "value", GSUHztoX( val / this.#nyquist ) );
				break;
		}
		GSUsetTimeout( () => this.#updateWave(), .02 );
	}

	// .........................................................................
	#updateWave() {
		if ( this.$isConnected ) {
			const curve = this.$askData( "curve", this.$elements.$curves.$getWidth() );

			if ( curve ) {
				this.$elements.$curves.$setCurve( "0", curve );
			}
		}
	}
	$updateAnalyser( data ) {
		this.$elements.$curves.$drawAnalyser( data );
	}

	// .........................................................................
	#toggleTypeBtn( type, b ) {
		GSUdomTogClass( GSUdomQS( this.$elements.$type, `[data-type="${ type }"]` ), "gsuiFxFilter-areaType-btnSelected", b );
	}

	// .........................................................................
	#oninputProp( prop, val ) {
		GSUdomDispatch( this, GSEV_EFFECT_FX_LIVECHANGE, prop, val );
		this.#updateWave();
	}
	#onclickType( e ) {
		const type = e.target.dataset.type;

		if ( type && !GSUdomHasClass( e.target, "gsuiFxFilter-areaType-btnSelected" ) ) {
			GSUdomDispatch( this, GSEV_EFFECT_FX_CHANGEPROP, "type", type );
		}
	}
}

GSUdefineElement( "gsui-fx-filter", gsuiFxFilter );
