"use strict";

class gsuiSynthesizer {
	constructor() {
		const root = gsuiSynthesizer.template.cloneNode( true );

		this.rootElement = root;
		this.oninput =
		this.onchange = () => {};
		this._waveList = [];
		this._nlOscs = root.getElementsByClassName( "gsuiOscillator" );
		this._elNewOsc = root.querySelector( ".gsuiSynthesizer-newOsc" );
		this._elOscList = root.querySelector( ".gsuiSynthesizer-oscList" );
		this._attached = false;
		this._uiOscs = new Map();
		Object.seal( this );

		this._elNewOsc.onclick = this._onclickNewOsc.bind( this );
		new gsuiReorder( {
			rootElement: this._elOscList,
			direction: "column",
			dataTransferType: "oscillator",
			itemSelector: ".gsuiOscillator",
			handleSelector: ".gsuiOscillator-grip",
			parentSelector: ".gsuiSynthesizer-oscList",
			onchange: this._onchangeReorder.bind( this ),
		} );
	}

	// .........................................................................
	attached() {
		this._attached = true;
		Array.from( this._nlOscs ).forEach( el => {
			this._uiOscs.get( el.dataset.id ).attached();
		} );
	}
	setWaveList( arr ) {
		this._waveList = arr;
		this._uiOscs.forEach( o => o.addWaves( arr ) );
	}
	getOscillator( id ) {
		return this._uiOscs.get( id );
	}

	// .........................................................................
	addOscillator( id, osc ) {
		const uiOsc = new gsuiOscillator();

		this._uiOscs.set( id, uiOsc );
		uiOsc.oninput = ( prop, val ) => this.oninput( id, prop, val );
		uiOsc.onchange = ( act, ...args ) => this.onchange( act, id, ...args );
		uiOsc.addWaves( this._waveList );
		uiOsc.rootElement.dataset.id = id;
		uiOsc.rootElement.dataset.order = osc.order;
		this._elOscList.append( uiOsc.rootElement );
		if ( this._attached ) {
			uiOsc.attached();
		}
	}
	removeOscillator( id ) {
		const osc = this._uiOscs.get( id );

		if ( osc ) {
			osc.rootElement.remove();
			this._uiOscs.delete( id );
		}
	}
	reorderOscillators( obj ) {
		gsuiReorder.listReorder( this._elOscList, obj );
	}

	// events:
	// .........................................................................
	_onclickNewOsc() {
		this.onchange( "addOscillator" );
	}
	_onchangeReorder() {
		const oscs = gsuiReorder.listComputeOrderChange( this._elOscList, {} );

		this.onchange( "reorderOscillator", oscs );
	}
}

gsuiSynthesizer.template = document.querySelector( "#gsuiSynthesizer-template" );
gsuiSynthesizer.template.remove();
gsuiSynthesizer.template.removeAttribute( "id" );
