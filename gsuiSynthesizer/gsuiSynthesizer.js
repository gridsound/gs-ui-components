"use strict";

class gsuiSynthesizer extends gsui0ne {
	#waveList = [];
	#uiOscs = new Map();
	#shadow = null;
	#data = {
		noise: {},
		env: {
			gain: {},
			detune: {},
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
		this.$elements.$newOsc.ondragenter = () => this.#ondrag( true );
		this.$elements.$newOsc.ondragleave = () => this.#ondrag( false );
		this.$elements.$newOsc.ondrop = e => {
			const [ bufType, bufId ] = GSUgetDataTransfer( e, [
				"pattern-buffer",
				"library-buffer:default",
				"library-buffer:local",
			] );

			this.#ondrag( false );
			if ( bufId ) {
				this.$dispatch( "addNewBuffer", bufType, bufId );
			}
			return false;
		};
		this.$elements.$heads.forEach( el => el.onclick = onclickHeadsBind );
		new gsuiReorder( {
			rootElement: this.$elements.$oscList,
			direction: "column",
			dataTransferType: "oscillator",
			itemSelector: "gsui-oscillator",
			handleSelector: ".gsuiOscillator-grip",
			parentSelector: ".gsuiSynthesizer-oscList",
			onchange: this.#onchangeReorder.bind( this ),
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

						if ( GSUgetAttribute( elCmp, lfoEnv ) === prop ) {
							GSUsetAttribute( elCmp, "toggle", d.args[ 0 ] );
						}
						this.$dispatch( lfoEnv === "env" ? "toggleEnv" : "toggleLFO", prop, d.args[ 0 ] );
					}
				},
			},
			gsuiNoise: {
				input: d => this.$dispatch( "inputNoise", ...d.args ),
				change: d => this.$dispatch( "changeNoise", ...d.args ),
			},
		} );
		this.#selectTab( "env", "gain" );
		this.#selectTab( "lfo", "gain" );
	}

	// .........................................................................
	$connected() {
		this.#shadow = new gsuiScrollShadow( {
			scrolledElem: this.querySelector( ".gsuiSynthesizer-scrollArea" ),
			topShadow: this.querySelector( ".gsuiSynthesizer-shadowTop" ),
			bottomShadow: this.querySelector( ".gsuiSynthesizer-shadowBottom" ),
		} );
	}
	$disconnected() {
		this.#shadow.$disconnected();
	}
	static get observedAttributes() {
		return [ "timedivision" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "timedivision":
				GSUsetAttribute( this.$elements.$env, "timedivision", val );
				GSUsetAttribute( this.$elements.$lfo, "timedivision", val );
				break;
		}
	}

	// .........................................................................
	$setWaveList( arr ) {
		this.#waveList = arr;
		this.#uiOscs.forEach( o => o.addWaves( arr ) );
	}
	$getOscillator( id ) {
		return this.#uiOscs.get( id );
	}

	// .........................................................................
	$updateGraph( envLFO, prop ) {
		const elCmp = envLFO === "env" ? this.$elements.$env : this.$elements.$lfo;

		if ( prop === GSUgetAttribute( elCmp, envLFO ) ) {
			elCmp.$updateWave();
		}
	}
	$changeNoiseProp( prop, val ) {
		this.#data.noise[ prop ] = val;
		GSUsetAttribute( this.$elements.$noise, prop, val );
		if ( prop === "toggle" ) {
			GSUsetAttribute( this.$elements.$noiseToggle, "off", !val );
		}
	}
	$changeEnvProp( env, prop, val ) {
		this.#data.env[ env ][ prop ] = val;
		if ( env === GSUgetAttribute( this.$elements.$env, "env" ) ) {
			GSUsetAttribute( this.$elements.$env, prop, val );
		}
		if ( prop === "toggle" ) {
			GSUsetAttribute( this.$elements.$tabs.env[ env ].firstChild, "off", !val );
		}
	}
	$changeLFOProp( lfo, prop, val ) {
		this.#data.lfo[ lfo ][ prop ] = val;
		if ( lfo === GSUgetAttribute( this.$elements.$lfo, "lfo" ) ) {
			GSUsetAttribute( this.$elements.$lfo, prop, val );
		}
		if ( prop === "toggle" ) {
			GSUsetAttribute( this.$elements.$tabs.lfo[ lfo ].firstChild, "off", !val );
		}
	}

	// .........................................................................
	$addOscillator( id, props ) {
		const uiOsc = GSUcreateElement( "gsui-oscillator", { ...props, "data-id": id } );

		this.#uiOscs.set( id, uiOsc );
		uiOsc.addWaves( this.#waveList );
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
	$reorderOscillators( obj ) {
		gsuiReorder.listReorder( this.$elements.$oscList, obj );
	}

	// .........................................................................
	#selectTab( lfoEnv, prop ) {
		const tabs = this.$elements.$tabs[ lfoEnv ];

		if ( !GSUhasAttribute( tabs[ prop ], "data-selected" ) ) {
			const elCmp = lfoEnv === "env" ? this.$elements.$env : this.$elements.$lfo;

			GSUforEach( tabs, el => GSUsetAttribute( el, "data-selected", el.dataset.tab.endsWith( prop ) ) );
			GSUsetAttribute( elCmp, this.#data[ lfoEnv ][ prop ] );
			GSUsetAttribute( elCmp, lfoEnv, prop );
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
	#onchangeReorder() {
		const oscs = gsuiReorder.listComputeOrderChange( this.$elements.$oscList, {} );

		this.$dispatch( "reorderOscillator", oscs );
	}
	#ondrag( b ) {
		GSUsetAttribute( this.$elements.$newOsc, "data-hover", b );
		GSUsetAttribute( this.$elements.$newOsc.firstChild, "data-icon", b ? "arrow-dropdown" : "plus" );
		GSUsetAttribute( this.$elements.$newOsc.firstChild, "animate", b );
	}
}

GSUdefineElement( "gsui-synthesizer", gsuiSynthesizer );
