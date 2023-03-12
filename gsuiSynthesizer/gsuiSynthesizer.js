"use strict";

class gsuiSynthesizer extends HTMLElement {
	#waveList = [];
	#uiOscs = new Map();
	#children = GSUI.$getTemplate( "gsui-synthesizer" );
	#elements = GSUI.$findElements( this.#children, {
		toggleEnv: "gsui-toggle[data-related='env']",
		toggleLFO: "gsui-toggle[data-related='lfo']",
		env: "gsui-envelope",
		lfo: "gsui-lfo",
		oscList: ".gsuiSynthesizer-oscList",
		newOsc: ".gsuiSynthesizer-newOsc",
	} );

	constructor() {
		super();
		this.env = this.#elements.env;
		this.lfo = this.#elements.lfo;
		Object.seal( this );

		this.#elements.newOsc.onclick = this.#onclickNewOsc.bind( this );
		new gsuiReorder( {
			rootElement: this.#elements.oscList,
			direction: "column",
			dataTransferType: "oscillator",
			itemSelector: "gsui-oscillator",
			handleSelector: ".gsuiOscillator-grip",
			parentSelector: ".gsuiSynthesizer-oscList",
			onchange: this.#onchangeReorder.bind( this ),
		} );
		GSUI.$listenEvents( this, {
			gsuiToggle: {
				toggle: ( d, btn ) => {
					const isEnv = btn.dataset.related === "env";
					const ev = isEnv ? "toggleEnv" : "toggleLFO";
					const el = isEnv ? this.#elements.env : this.#elements.lfo;

					GSUI.$setAttribute( el, "toggle", d.args[ 0 ] );
					GSUI.$dispatchEvent( this, "gsuiSynthesizer", ev, d.args[ 0 ] );
				},
			},
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( ...this.#children );
			this.#children = null;
		}
	}

	// .........................................................................
	setWaveList( arr ) {
		this.#waveList = arr;
		this.#uiOscs.forEach( o => o.addWaves( arr ) );
	}
	getOscillator( id ) {
		return this.#uiOscs.get( id );
	}

	// .........................................................................
	changeEnvProp( prop, val ) {
		if ( prop === "toggle" ) {
			GSUI.$setAttribute( this.#elements.toggleEnv, "off", !val );
		}
		GSUI.$setAttribute( this.#elements.env, prop, val );
	}
	changeLFOProp( prop, val ) {
		if ( prop === "toggle" ) {
			GSUI.$setAttribute( this.#elements.toggleLFO, "off", !val );
		}
		GSUI.$setAttribute( this.#elements.lfo, prop, val );
	}

	// .........................................................................
	addOscillator( id ) {
		const uiOsc = GSUI.$createElement( "gsui-oscillator", { "data-id": id } );

		this.#uiOscs.set( id, uiOsc );
		uiOsc.addWaves( this.#waveList );
		this.#elements.oscList.append( uiOsc );
	}
	removeOscillator( id ) {
		const osc = this.#uiOscs.get( id );

		if ( osc ) {
			osc.remove();
			this.#uiOscs.delete( id );
		}
	}
	reorderOscillators( obj ) {
		gsuiReorder.listReorder( this.#elements.oscList, obj );
	}

	// .........................................................................
	#onclickNewOsc() {
		GSUI.$dispatchEvent( this, "gsuiSynthesizer", "addOscillator" );
	}
	#onchangeReorder() {
		const oscs = gsuiReorder.listComputeOrderChange( this.#elements.oscList, {} );

		GSUI.$dispatchEvent( this, "gsuiSynthesizer", "reorderOscillator", oscs );
	}
}

Object.freeze( gsuiSynthesizer );
customElements.define( "gsui-synthesizer", gsuiSynthesizer );
