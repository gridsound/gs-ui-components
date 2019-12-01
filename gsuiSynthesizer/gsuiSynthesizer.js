"use strict";

class gsuiSynthesizer {
	constructor() {
		const root = gsuiSynthesizer.template.cloneNode( true ),
			dnd = new gsuiReorder(),
			uiLFO = new gsuiLFO(),
			gsdata = new GSDataSynth( {
				actionCallback: ( obj, msg ) => this.onchange( obj, msg ),
				dataCallbacks: {
					addOsc: this._addOsc.bind( this ),
					removeOsc: this._removeOsc.bind( this ),
					updateOsc: ( id, osc ) => this._uiOscs.get( id ).change( osc ),
					updateLFO: lfo => this._uiLFO.change( lfo ),
				},
			} );

		this.rootElement = root;
		this.gsdata = gsdata;
		this._waveList = [];
		this._nlOscs = root.getElementsByClassName( "gsuiOscillator" );
		this._elOscList = root.querySelector( ".gsuiSynthesizer-oscList" );
		this._elNewOsc = root.querySelector( ".gsuiSynthesizer-newOsc" );
		this.oninput =
		this.onchange = () => {};
		this._attached = false;
		this._uiLFO = uiLFO;
		this._uiOscs = new Map();
		Object.seal( this );

		root.querySelector( ".gsuiSynthesizer-lfo" ).append( uiLFO.rootElement );
		this._elNewOsc.onclick = gsdata.callAction.bind( gsdata, "addOsc" );
		this.empty();
		uiLFO.oninput = ( prop, val ) => this.oninput( { lfo: { [ prop ]: val } } );
		uiLFO.onchange = gsdata.callAction.bind( gsdata, "changeLFO" );
		dnd.setRootElement( this._elOscList );
		dnd.setSelectors( {
			item: ".gsuiOscillator",
			handle: ".gsuiOscillator-grip",
			parent: ".gsuiSynthesizer-oscList",
		} );
		dnd.onchange = () => {
			const oscillators = gsuiReorder.listComputeOrderChange( this._elOscList, {} );

			this.onchange(
				{ oscillators },
				[ "synth", "reorderOsc", this.gsdata.data.name ]
			);
		};
	}

	remove() {
		this._attached = false;
		this.rootElement.remove();
	}
	attached() {
		const list = this._elOscList;

		this._attached = true;
		this._uiLFO.attached();
		Array.from( this._nlOscs ).forEach( el => {
			this._uiOscs.get( el.dataset.id ).attached();
		} );
	}
	resizing() {
		this._uiLFO.resizing();
	}
	resize() {
		this._uiLFO.resize();
	}
	empty() {
		this.gsdata.clear();
	}
	timeSignature( a, b ) {
		this._uiLFO.timeSignature( a, b );
	}
	setWaveList( arr ) {
		this._waveList = arr;
		this._uiOscs.forEach( o => o.addWaves( arr ) );
	}
	change( obj ) {
		this.gsdata.change( obj );
		if ( obj.oscillators ) {
			gsuiReorder.listReorder( this._elOscList, obj.oscillators );
		}
	}

	// .........................................................................
	_addOsc( id, osc ) {
		const uiosc = new gsuiOscillator(),
			gsd = this.gsdata;

		this._uiOscs.set( id, uiosc );
		uiosc.oninput = ( prop, val ) => this.oninput( { oscillators: { [ id ]: { [ prop ]: val } } } );
		uiosc.onchange = gsd.callAction.bind( gsd, "changeOsc", id );
		uiosc.onremove = gsd.callAction.bind( gsd, "removeOsc", id );
		uiosc.addWaves( this._waveList );
		uiosc.change( osc );
		uiosc.rootElement.dataset.id = id;
		uiosc.rootElement.dataset.order = osc.order;
		this._elOscList.append( uiosc.rootElement );
		this._attached && uiosc.attached();
	}
	_removeOsc( id ) {
		const osc = this._uiOscs.get( id );

		if ( osc ) {
			osc.remove();
			this._uiOscs.delete( id );
		}
	}
}

gsuiSynthesizer.template = document.querySelector( "#gsuiSynthesizer-template" );
gsuiSynthesizer.template.remove();
gsuiSynthesizer.template.removeAttribute( "id" );
