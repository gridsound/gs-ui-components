"use strict";

class gsuiSynthesizer extends gsui0ne {
	static #presetList = [];
	#waveList = [];
	#uiOscs = new Map();
	#shadow = null;
	#previews = {};
	#data = {
		noise: {},
		env: {
			gain: {},
			detune: {},
			lowpass: {},
		},
		lfo: {
			gain: {},
			detune: {},
		},
	};
	#dispatchPresetDeb = GSUdebounce( this.#dispatchPreset.bind( this ), .25 );

	constructor() {
		super( {
			$cmpName: "gsuiSynthesizer",
			$tagName: "gsui-synthesizer",
			$jqueryfy: true,
			$elements: {
				$heads: ".gsuiSynthesizer-head",
				$presetBtns: ".gsuiSynthesizer-preset button",
				$presetName: ".gsuiSynthesizer-preset > span:last-child",
				$tabs: ".gsuiSynthesizer-headTab",
				$noise: "gsui-noise",
				$noiseToggle: ".gsuiSynthesizer-headNoise gsui-toggle",
				$env: "gsui-envelope",
				$lfo: "gsui-lfo",
				$oscList: ".gsuiSynthesizer-oscList",
				$newOsc: ".gsuiSynthesizer-newOsc",
			},
			$attributes: {
				timedivision: "4/4",
				// env: "gain",
				// lfo: "gain",
			},
		} );
		Object.seal( this );
		this.$elements.$presetBtns.$on( "click", this.#onclickPreset.bind( this ) );
		this.$elements.$newOsc.$on( "click", this.#onclickNewOsc.bind( this ) );
		this.$elements.$heads.$on( "click", this.#onclickHeads.bind( this ) );
		new gsuiReorder( {
			$root: this.$elements.$oscList.$at( 0 ),
			$parentSelector: ".gsuiSynthesizer-oscList",
			$itemSelector: "gsui-oscillator",
			$itemGripSelector: ".gsuiOscillator-grip",
			$onchange: obj => GSUdomDispatch( this, GSEV_SYNTHESIZER_REORDEROSCILLATOR, obj ),
		} );
		GSUdomListen( this, {
			[ GSEV_ENVELOPE_LIVECHANGE ]: () => GSUnoop,
			[ GSEV_OSCILLATOR_RESIZE ]: () => this.#shadow.$update(),
			[ GSEV_NOISE_INPUT ]: d => GSUdomDispatch( this, GSEV_SYNTHESIZER_INPUTNOISE, ...d.$args ),
			[ GSEV_NOISE_CHANGE ]: d => GSUdomDispatch( this, GSEV_SYNTHESIZER_CHANGENOISE, ...d.$args ),
			[ GSEV_TOGGLE_TOGGLE ]: ( d, b ) => {
				const tab = d.$target.parentNode.dataset.tab;

				if ( !tab ) {
					GSUdomDispatch( this, GSEV_SYNTHESIZER_TOGGLENOISE, b );
				} else {
					const [ lfoEnv, prop ] = d.$target.parentNode.dataset.tab.split( " " );
					const elCmp = lfoEnv === "env" ? this.$elements.$env : this.$elements.$lfo;

					if ( elCmp.$attr( lfoEnv ) === prop ) {
						elCmp.$attr( "toggle", b );
					}
					GSUdomDispatch( this, lfoEnv === "env" ? GSEV_SYNTHESIZER_TOGGLEENV : GSEV_SYNTHESIZER_TOGGLELFO, prop, b );
				}
			},
		} );
		this.#selectTab( "env", "gain" );
		this.#selectTab( "lfo", "gain" );
	}

	// .........................................................................
	$connected() {
		this.#shadow = new gsuiScrollShadow( {
			scrolledElem: GSUdomQS( this, ".gsuiSynthesizer-scrollArea" ),
			topShadow: GSUdomQS( this, ".gsuiSynthesizer-shadowTop" ),
			bottomShadow: GSUdomQS( this, ".gsuiSynthesizer-shadowBottom" ),
		} );
	}
	$disconnected() {
		GSUforEach( this.#previews, id => GSUclearTimeout( id ) );
		this.#previews = {};
		this.#shadow.$disconnected();
	}
	static get observedAttributes() {
		return [ "preset", "timedivision" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "preset":
				this.$elements.$presetName.$text( val );
				break;
			case "timedivision":
				this.$elements.$env.$attr( "timedivision", val );
				this.$elements.$lfo.$attr( "timedivision", val );
				break;
		}
	}

	// .........................................................................
	$startKeyPreview( keyId, key, bpm, when, dur ) {
		this.#previews[ keyId ] = GSUsetTimeout( () => {
			const wtposCurves = key.wtposCurves;

			this.#previews[ keyId ] = null;
			this.$elements.$env.$at( 0 ).$startKey( keyId, bpm, dur );
			this.$elements.$lfo.$at( 0 ).$startKey( keyId, bpm, dur );
			this.#uiOscs.forEach( ( osc, oscId ) => osc.$startKey( keyId, wtposCurves[ oscId ] || "0", bpm, dur ) );
		}, when );
	}
	$stopKeyPreview( keyId, bpm, rel ) {
		const pId = this.#previews[ keyId ];

		if ( pId ) {
			GSUclearTimeout( pId );
		}
		delete this.#previews[ keyId ];
		if ( pId === null ) {
			this.$elements.$env.$at( 0 ).$stopKey( keyId );
			GSUsetTimeout( () => {
				this.$elements.$lfo.$at( 0 ).$stopKey( keyId );
				this.#uiOscs.forEach( osc => osc.$stopKey( keyId ) );
			}, rel / ( bpm / 60 ) );
		}
	}

	// .........................................................................
	static $setPresetList( arr ) {
		gsuiSynthesizer.#presetList = [ ...arr ];
	}
	$setWaveList( arr ) {
		this.#waveList = arr;
		this.#uiOscs.forEach( ( o, id ) => {
			o.$addWaveCustom( GSUformatWavetableName( this.dataset.id, id ) );
			o.$addWaves( arr );
		} );
	}
	$getOscillator( id ) {
		return this.#uiOscs.get( id );
	}

	// .........................................................................
	$updateGraph( envLFO, prop ) {
		const elCmp = envLFO === "env" ? this.$elements.$env : this.$elements.$lfo;

		if ( prop === elCmp.$attr( envLFO ) ) {
			elCmp.$at( 0 ).$updateWave();
		}
	}
	$changeNoiseProp( prop, val ) {
		this.#data.noise[ prop ] = val;
		this.$elements.$noise.$attr( prop, val );
		if ( prop === "toggle" ) {
			this.$elements.$noiseToggle.$attr( "off", !val );
		}
	}
	$changeEnvProp( env, prop, val ) {
		this.#data.env[ env ][ prop ] = val;
		if ( env === this.$elements.$env.$attr( "env" ) ) {
			this.$elements.$env.$attr( prop, val );
		}
		if ( prop === "toggle" ) {
			this.$elements.$tabs
				.$filter( `[data-tab="env ${ prop }"]` )
				.$child( 0 ).$attr( "off", !val );
		}
	}
	$changeLFOProp( lfo, prop, val ) {
		this.#data.lfo[ lfo ][ prop ] = val;
		if ( lfo === this.$elements.$lfo.$attr( "lfo" ) ) {
			this.$elements.$lfo.$attr( prop, val );
		}
		if ( prop === "toggle" ) {
			this.$elements.$tabs
				.$filter( `[data-tab="lfo ${ prop }"]` )
				.$child( 0 ).$attr( "off", !val );
		}
	}

	// .........................................................................
	$addOscillator( id, props ) {
		const uiOsc = GSUcreateElement( "gsui-oscillator", { ...props, "data-id": id } );

		this.#uiOscs.set( id, uiOsc );
		uiOsc.$addWaveCustom( GSUformatWavetableName( this.dataset.id, id ) );
		uiOsc.$addWaves( this.#waveList );
		this.$elements.$oscList.$append( uiOsc );
		return uiOsc;
	}
	$removeOscillator( id ) {
		const osc = this.#uiOscs.get( id );

		if ( osc ) {
			osc.remove();
			this.#uiOscs.delete( id );
		}
	}

	// .........................................................................
	#selectTab( lfoEnv, prop ) {
		const tabs = this.$elements.$tabs.$filter( `[data-tab^="${ lfoEnv }"]` );
		const tab = tabs.$filter( `[data-tab$="${ prop }"]` );

		if ( !tab.$hasAttr( "data-selected" ) ) {
			tabs.$attr( "data-selected", el => el === tab.$at( 0 ) );
			( lfoEnv === "env" ? this.$elements.$env : this.$elements.$lfo )
				.$attr( this.#data[ lfoEnv ][ prop ] )
				.$attr( lfoEnv, prop );
		}
	}

	// .........................................................................
	#dispatchPreset( p ) {
		if ( p !== this.$this.$attr( "preset" ) ) {
			this.$this.$attr( "preset", p );
			GSUdomDispatch( this, GSEV_SYNTHESIZER_PRESET, p );
		}
	}
	#onclickPreset( e ) {
		const list = gsuiSynthesizer.#presetList;
		const dir = +e.target.dataset.action;
		const ind = list.indexOf( this.$elements.$presetName.$text() );
		const p = list[ GSUmathClamp( ind + dir, 0, list.length - 1 ) ];

		if ( p ) {
			this.$elements.$presetName.$text( p );
			this.#dispatchPresetDeb( p );
		}
	}
	#onclickHeads( e ) {
		if ( GSUdomHasClass( e.target, "gsuiSynthesizer-headExpand" ) ) {
			GSUdomTogAttr( e.currentTarget, "data-hidden" );
		} else {
			const tab = e.target.closest( ".gsuiSynthesizer-headTab" );

			if ( tab ) {
				GSUdomRmAttr( e.currentTarget, "data-hidden" );
				this.#selectTab( ...tab.dataset.tab.split( " " ) );
			}
		}
	}
	#onclickNewOsc() {
		GSUdomDispatch( this, GSEV_SYNTHESIZER_ADDOSCILLATOR );
	}
}

GSUdomDefine( "gsui-synthesizer", gsuiSynthesizer );
