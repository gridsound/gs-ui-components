"use strict";

class gsuiSynthesizer extends HTMLElement {
	#waveList = [];
	#uiOscs = new Map();
	#children = GSUgetTemplate( "gsui-synthesizer" );
	#elements = GSUfindElements( this.#children, {
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
		this.#elements.newOsc.ondragenter = () => this.#ondrag( true );
		this.#elements.newOsc.ondragleave = () => this.#ondrag( false );
		this.#elements.newOsc.ondrop = e => {
			const data = e.dataTransfer.getData( "pattern-buffer" );

			this.#ondrag( false );
			if ( data ) {
				GSUdispatchEvent( this, "gsuiSynthesizer", "addNewBuffer", data );
			}
			return false;
		};
		new gsuiReorder( {
			rootElement: this.#elements.oscList,
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
					const isEnv = btn.dataset.related === "env";
					const ev = isEnv ? "toggleEnv" : "toggleLFO";
					const el = isEnv ? this.#elements.env : this.#elements.lfo;

					GSUsetAttribute( el, "toggle", d.args[ 0 ] );
					GSUdispatchEvent( this, "gsuiSynthesizer", ev, d.args[ 0 ] );
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
			GSUsetAttribute( this.#elements.toggleEnv, "off", !val );
		}
		GSUsetAttribute( this.#elements.env, prop, val );
	}
	changeLFOProp( prop, val ) {
		if ( prop === "toggle" ) {
			GSUsetAttribute( this.#elements.toggleLFO, "off", !val );
		}
		GSUsetAttribute( this.#elements.lfo, prop, val );
	}

	// .........................................................................
	addOscillator( id ) {
		const uiOsc = GSUcreateElement( "gsui-oscillator", { "data-id": id } );

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
		GSUdispatchEvent( this, "gsuiSynthesizer", "addOscillator" );
	}
	#onchangeReorder() {
		const oscs = gsuiReorder.listComputeOrderChange( this.#elements.oscList, {} );

		GSUdispatchEvent( this, "gsuiSynthesizer", "reorderOscillator", oscs );
	}
	#ondrag( b ) {
		GSUsetAttribute( this.#elements.newOsc, "data-hover", b );
		GSUsetAttribute( this.#elements.newOsc.firstChild, "data-icon", b ? "arrow-dropdown" : "plus" );
		GSUsetAttribute( this.#elements.newOsc.firstChild, "animate", b );
	}
}

Object.freeze( gsuiSynthesizer );
customElements.define( "gsui-synthesizer", gsuiSynthesizer );
