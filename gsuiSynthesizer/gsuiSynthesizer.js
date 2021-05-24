"use strict";

class gsuiSynthesizer extends HTMLElement {
	#waveList = []
	#uiOscs = new Map()
	#children = GSUI.getTemplate( "gsui-synthesizer" )
	#elements = GSUI.findElements( this.#children, {
		env: "gsui-envelope",
		lfo: "gsui-lfo",
		oscList: ".gsuiSynthesizer-oscList",
		newOsc: ".gsuiSynthesizer-newOsc",
	} )

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
			itemSelector: ".gsuiOscillator",
			handleSelector: ".gsuiOscillator-grip",
			parentSelector: ".gsuiSynthesizer-oscList",
			onchange: this.#onchangeReorder.bind( this ),
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.classList.add( "gsuiSynthesizer" );
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
	addOscillator( id, osc ) {
		const uiOsc = document.createElement( "gsui-oscillator" );

		this.#uiOscs.set( id, uiOsc );
		uiOsc.addWaves( this.#waveList );
		uiOsc.dataset.id = id;
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

	// events:
	// .........................................................................
	#onclickNewOsc() {
		GSUI.dispatchEvent( this, "gsuiSynthesizer", "addOscillator" );
	}
	#onchangeReorder() {
		const oscs = gsuiReorder.listComputeOrderChange( this.#elements.oscList, {} );

		GSUI.dispatchEvent( this, "gsuiSynthesizer", "reorderOscillator", oscs );
	}
}

customElements.define( "gsui-synthesizer", gsuiSynthesizer );
