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
			$jqueryfy: true,
			$elements: {
				$type: "[data-area='type'] > div",
				$graph: "[data-area='graph'] > div",
				$curves: "gsui-curves",
				$sliders: "gsui-slider",
			},
		} );
		Object.seal( this );
		this.$elements.$type.$on( "click", this.#onclickType.bind( this ) );
		GSUdomListen( this, {
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( d, val ) => this.#oninputProp( d.$target.dataset.prop, this.#fnValue[ d.$target.dataset.prop ]( val ) ),
			[ GSEV_SLIDER_CHANGE ]: ( d, val ) => this.$this.$dispatch( GSEV_EFFECT_FX_CHANGEPROP, d.$target.dataset.prop, this.#fnValue[ d.$target.dataset.prop ]( val ) ),
		} );
		this.$elements.$graph.$append( this.$elements.$curves );
	}

	// .........................................................................
	$connected() {
		this.#updateWave();
	}
	static get observedAttributes() {
		return [ "type", "frequency", "q", "gain", "detune" ]; // "off"
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "type":
				this.#toggleTypeBtn( this.#currType, false );
				this.#toggleTypeBtn( val, true );
				this.#currType = val;
				this.#getSlider( "q" ).$setAttr( "disabled", !gsuiFxFilter.typeGainQ[ val ].q );
				this.#getSlider( "gain" ).$setAttr( "disabled", !gsuiFxFilter.typeGainQ[ val ].gain );
				break;
			case "q":
			case "gain":
			case "detune":
				this.#getSlider( prop ).$setAttr( "value", val );
				break;
			case "frequency":
				this.#getSlider( "frequency" ).$setAttr( "value", GSUHztoX( val / this.#nyquist ) );
				break;
		}
		GSUsetTimeout( () => this.#updateWave(), .02 );
	}

	// .........................................................................
	#updateWave() {
		if ( this.$isConnected ) {
			const elCurve = this.$elements.$curves.$get( 0 );
			const curve = this.$askData( "curve", elCurve.$getWidth() );

			if ( curve ) {
				elCurve.$setCurve( "0", curve );
			}
		}
	}
	$updateAnalyser( data ) {
		this.$elements.$curves.$get( 0 ).$drawAnalyser( data );
	}

	// .........................................................................
	#toggleTypeBtn( type, b ) {
		this.$elements.$type.$find( `[data-type="${ type }"]` ).$setAttr( "data-selected", b );
	}

	// .........................................................................
	#getSlider( prop ) {
		return this.$elements.$sliders.$filter( `[data-area="${ prop }"] *` );
	}
	#oninputProp( prop, val ) {
		this.$this.$dispatch( GSEV_EFFECT_FX_LIVECHANGE, prop, val );
		this.#updateWave();
	}
	#onclickType( e ) {
		const type = e.target.dataset.type;

		if ( type && !GSUdomHasAttr( e.target, "data-selected" ) ) {
			this.$this.$dispatch( GSEV_EFFECT_FX_CHANGEPROP, "type", type );
		}
	}
}

GSUdomDefine( "gsui-fx-filter", gsuiFxFilter );
