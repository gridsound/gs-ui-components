"use strict";

class gsuiSynthesizer extends gsui0ne {
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

	constructor() {
		super( {
			$cmpName: "gsuiSynthesizer",
			$tagName: "gsui-synthesizer",
			$elements: {
				$heads: "[].gsuiSynthesizer-head",
				$tabs: {
					env: {
						gain: "[data-tab='env gain']",
						detune: "[data-tab='env detune']",
						lowpass: "[data-tab='env lowpass']",
					},
					lfo: {
						gain: "[data-tab='lfo gain']",
						detune: "[data-tab='lfo detune']",
					},
				},
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

		const onclickHeadsBind = this.#onclickHeads.bind( this );

		this.$elements.$newOsc.onclick = this.#onclickNewOsc.bind( this );
		this.$elements.$heads.forEach( el => el.onclick = onclickHeadsBind );
		new gsuiReorder( {
			$root: this.$elements.$oscList,
			$parentSelector: ".gsuiSynthesizer-oscList",
			$itemSelector: "gsui-oscillator",
			$itemGripSelector: ".gsuiOscillator-grip",
			$onchange: obj => this.$dispatch( "reorderOscillator", obj ),
		} );
		GSUlistenEvents( this, {
			gsuiToggle: {
				toggle: ( d, btn ) => {
					const tab = btn.parentNode.dataset.tab;

					if ( !tab ) {
						this.$dispatch( "toggleNoise", d.args[ 0 ] )
					} else {
						const [ lfoEnv, prop ] = btn.parentNode.dataset.tab.split( " " );
						const elCmp = lfoEnv === "env" ? this.$elements.$env : this.$elements.$lfo;

						if ( GSUdomGetAttr( elCmp, lfoEnv ) === prop ) {
							GSUdomSetAttr( elCmp, "toggle", d.args[ 0 ] );
						}
						this.$dispatch( lfoEnv === "env" ? "toggleEnv" : "toggleLFO", prop, d.args[ 0 ] );
					}
				},
			},
			gsuiNoise: {
				input: d => this.$dispatch( "inputNoise", ...d.args ),
				change: d => this.$dispatch( "changeNoise", ...d.args ),
			},
			gsuiOscillator: {
				resize: () => this.#shadow.$update(),
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
		return [ "timedivision" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "timedivision":
				GSUdomSetAttr( this.$elements.$env, "timedivision", val );
				GSUdomSetAttr( this.$elements.$lfo, "timedivision", val );
				break;
		}
	}

	// .........................................................................
	$startKeyPreview( keyId, key, bpm, when, dur ) {
		this.#previews[ keyId ] = GSUsetTimeout( () => {
			const wtposCurves = key.wtposCurves;

			this.#previews[ keyId ] = null;
			this.$elements.$env.$startKey( keyId, bpm, dur );
			this.$elements.$lfo.$startKey( keyId, bpm, dur );
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
			this.$elements.$env.$stopKey( keyId );
			GSUsetTimeout( () => {
				this.$elements.$lfo.$stopKey( keyId );
				this.#uiOscs.forEach( osc => osc.$stopKey( keyId ) );
			}, rel / ( bpm / 60 ) );
		}
	}

	// .........................................................................
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

		if ( prop === GSUdomGetAttr( elCmp, envLFO ) ) {
			elCmp.$updateWave();
		}
	}
	$changeNoiseProp( prop, val ) {
		this.#data.noise[ prop ] = val;
		GSUdomSetAttr( this.$elements.$noise, prop, val );
		if ( prop === "toggle" ) {
			GSUdomSetAttr( this.$elements.$noiseToggle, "off", !val );
		}
	}
	$changeEnvProp( env, prop, val ) {
		this.#data.env[ env ][ prop ] = val;
		if ( env === GSUdomGetAttr( this.$elements.$env, "env" ) ) {
			GSUdomSetAttr( this.$elements.$env, prop, val );
		}
		if ( prop === "toggle" ) {
			GSUdomSetAttr( this.$elements.$tabs.env[ env ].firstChild, "off", !val );
		}
	}
	$changeLFOProp( lfo, prop, val ) {
		this.#data.lfo[ lfo ][ prop ] = val;
		if ( lfo === GSUdomGetAttr( this.$elements.$lfo, "lfo" ) ) {
			GSUdomSetAttr( this.$elements.$lfo, prop, val );
		}
		if ( prop === "toggle" ) {
			GSUdomSetAttr( this.$elements.$tabs.lfo[ lfo ].firstChild, "off", !val );
		}
	}

	// .........................................................................
	$addOscillator( id, props ) {
		const uiOsc = GSUcreateElement( "gsui-oscillator", { ...props, "data-id": id } );

		this.#uiOscs.set( id, uiOsc );
		uiOsc.$addWaveCustom( GSUformatWavetableName( this.dataset.id, id ) );
		uiOsc.$addWaves( this.#waveList );
		this.$elements.$oscList.append( uiOsc );
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
		const tabs = this.$elements.$tabs[ lfoEnv ];

		if ( !GSUdomHasAttr( tabs[ prop ], "data-selected" ) ) {
			const elCmp = lfoEnv === "env" ? this.$elements.$env : this.$elements.$lfo;

			GSUforEach( tabs, el => GSUdomSetAttr( el, "data-selected", el.dataset.tab.endsWith( prop ) ) );
			GSUdomSetAttr( elCmp, this.#data[ lfoEnv ][ prop ] );
			GSUdomSetAttr( elCmp, lfoEnv, prop );
		}
	}

	// .........................................................................
	#onclickHeads( e ) {
		const tab = ( e.target.tagName === "GSUI-TOGGLE"
			? e.target.parentNode
			: e.target ).dataset.tab;

		if ( tab ) {
			this.#selectTab( ...tab.split( " " ) );
		}
	}
	#onclickNewOsc() {
		this.$dispatch( "addOscillator" );
	}
}

GSUdefineElement( "gsui-synthesizer", gsuiSynthesizer );
