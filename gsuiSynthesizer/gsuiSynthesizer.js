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
			$root: this.$elements.$oscList.$get( 0 ),
			$parentSelector: ".gsuiSynthesizer-oscList",
			$itemSelector: "gsui-oscillator",
			$itemGripSelector: ".gsuiOscillator-grip",
			$onchange: obj => this.$this.$dispatch( GSEV_SYNTHESIZER_REORDEROSCILLATOR, obj ),
		} );
		GSUdomListen( this, {
			[ GSEV_ENVELOPE_LIVECHANGE ]: () => GSUnoop,
			[ GSEV_OSCILLATOR_RESIZE ]: () => this.#shadow.$update(),
			[ GSEV_NOISE_INPUT ]: d => this.$this.$dispatch( GSEV_SYNTHESIZER_INPUTNOISE, ...d.$args ),
			[ GSEV_NOISE_CHANGE ]: d => this.$this.$dispatch( GSEV_SYNTHESIZER_CHANGENOISE, ...d.$args ),
			[ GSEV_TOGGLE_TOGGLE ]: ( d, b ) => {
				const tab = d.$target.parentNode.dataset.tab;

				if ( !tab ) {
					this.$this.$dispatch( GSEV_SYNTHESIZER_TOGGLENOISE, b );
				} else {
					const [ lfoEnv, prop ] = d.$target.parentNode.dataset.tab.split( " " );
					const elCmp = lfoEnv === "env" ? this.$elements.$env : this.$elements.$lfo;

					if ( elCmp.$getAttr( lfoEnv ) === prop ) {
						elCmp.$setAttr( "toggle", b );
					}
					this.$this.$dispatch( lfoEnv === "env" ? GSEV_SYNTHESIZER_TOGGLEENV : GSEV_SYNTHESIZER_TOGGLELFO, prop, b );
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
				this.$elements.$env.$setAttr( "timedivision", val );
				this.$elements.$lfo.$setAttr( "timedivision", val );
				break;
		}
	}

	// .........................................................................
	$startKeyPreview( keyId, key, bpm, when, dur ) {
		this.#previews[ keyId ] = GSUsetTimeout( () => {
			const wtposCurves = key.wtposCurves;

			this.#previews[ keyId ] = null;
			this.$elements.$env.$get( 0 ).$startKey( keyId, bpm, dur );
			this.$elements.$lfo.$get( 0 ).$startKey( keyId, bpm, dur );
			this.#uiOscs.forEach( ( osc, oscId ) => osc.$message( GSEV_OSCILLATOR_STARTKEY, keyId, wtposCurves[ oscId ] || "0", bpm, dur ) );
		}, when );
	}
	$stopKeyPreview( keyId, bpm, rel ) {
		const pId = this.#previews[ keyId ];

		if ( pId ) {
			GSUclearTimeout( pId );
		}
		delete this.#previews[ keyId ];
		if ( pId === null ) {
			this.$elements.$env.$get( 0 ).$stopKey( keyId );
			GSUsetTimeout( () => {
				this.$elements.$lfo.$get( 0 ).$stopKey( keyId );
				this.#uiOscs.forEach( osc => osc.$message( GSEV_OSCILLATOR_STOPKEY, keyId ) );
			}, rel / ( bpm / 60 ) );
		}
	}

	// .........................................................................
	static $setPresetList( arr ) {
		gsuiSynthesizer.#presetList = [ ...arr ];
	}
	$setWaveList( arr ) {
		this.#waveList = arr;
		this.#uiOscs.forEach( ( osc, id ) => {
			osc.$message( GSEV_OSCILLATOR_ADDCUSTOMWAVE, GSUformatWavetableName( this.dataset.id, id ) )
				.$message( GSEV_OSCILLATOR_ADDWAVES, arr );
		} );
	}
	$getOscillator( id ) {
		return this.#uiOscs.get( id );
	}

	// .........................................................................
	$updateGraph( envLFO, prop ) {
		const elCmp = envLFO === "env" ? this.$elements.$env : this.$elements.$lfo;

		if ( prop === elCmp.$getAttr( envLFO ) ) {
			elCmp.$get( 0 ).$updateWave();
		}
	}
	$changeNoiseProp( prop, val ) {
		this.#data.noise[ prop ] = val;
		this.$elements.$noise.$setAttr( prop, val );
		if ( prop === "toggle" ) {
			this.$elements.$noiseToggle.$setAttr( "off", !val );
		}
	}
	$changeEnvProp( env, prop, val ) {
		this.#data.env[ env ][ prop ] = val;
		if ( env === this.$elements.$env.$getAttr( "env" ) ) {
			this.$elements.$env.$setAttr( prop, val );
		}
		if ( prop === "toggle" ) {
			this.$elements.$tabs
				.$filter( `[data-tab="env ${ env }"]` )
				.$child( 0 ).$setAttr( "off", !val );
		}
	}
	$changeLFOProp( lfo, prop, val ) {
		this.#data.lfo[ lfo ][ prop ] = val;
		if ( lfo === this.$elements.$lfo.$getAttr( "lfo" ) ) {
			this.$elements.$lfo.$setAttr( prop, val );
		}
		if ( prop === "toggle" ) {
			this.$elements.$tabs
				.$filter( `[data-tab="lfo ${ lfo }"]` )
				.$child( 0 ).$setAttr( "off", !val );
		}
	}

	// .........................................................................
	$addOscillator( id, props ) {
		const uiOsc = $( "<gsui-oscillator>" ).$setAttr( { ...props, "data-id": id } );

		this.#uiOscs.set( id, uiOsc );
		uiOsc.$message( GSEV_OSCILLATOR_ADDCUSTOMWAVE, GSUformatWavetableName( this.dataset.id, id ) )
			.$message( GSEV_OSCILLATOR_ADDWAVES, this.#waveList );
		this.$elements.$oscList.$append( uiOsc );
		return uiOsc;
	}
	$removeOscillator( id ) {
		const osc = this.#uiOscs.get( id );

		if ( osc ) {
			osc.$remove();
			this.#uiOscs.delete( id );
		}
	}

	// .........................................................................
	#selectTab( lfoEnv, prop ) {
		const tabs = this.$elements.$tabs.$filter( `[data-tab^="${ lfoEnv }"]` );
		const tab = tabs.$filter( `[data-tab$="${ prop }"]` );

		if ( !tab.$hasAttr( "data-selected" ) ) {
			tabs.$setAttr( "data-selected", el => el === tab.$get( 0 ) );
			( lfoEnv === "env" ? this.$elements.$env : this.$elements.$lfo )
				.$setAttr( this.#data[ lfoEnv ][ prop ] )
				.$setAttr( lfoEnv, prop );
		}
	}

	// .........................................................................
	#dispatchPreset( p ) {
		if ( p !== this.$this.$getAttr( "preset" ) ) {
			this.$this
				.$setAttr( "preset", p )
				.$dispatch( GSEV_SYNTHESIZER_PRESET, p );
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
		this.$this.$dispatch( GSEV_SYNTHESIZER_ADDOSCILLATOR );
	}
}

GSUdomDefine( "gsui-synthesizer", gsuiSynthesizer );
