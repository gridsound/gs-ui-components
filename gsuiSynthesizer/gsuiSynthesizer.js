"use strict";

class gsuiSynthesizer {
	constructor() {
		const root = gsuiSynthesizer.template.cloneNode( true );

		this.rootElement = root;
		this._waveList = [];
		this._nlOscs = root.getElementsByClassName( "gsuiOscillator" );
		this._elOscList = root.querySelector( ".gsuiSynthesizer-oscList" );
		this._elNewOsc = root.querySelector( ".gsuiSynthesizer-newOsc" );
		this.oninput =
		this.onchange = () => {};
		this._attached = false;
		this._uioscs = new Map();
		this._nextOscId = 0;
		this.store = Object.seal( { oscillators: {} } );
		Object.seal( this );

		this._elNewOsc.onclick = this._onclickNewOsc.bind( this );
		this.empty();
	}

	remove() {
		this._attached = false;
		this.rootElement.remove();
	}
	attached() {
		const list = this._elOscList,
			head = this.rootElement.querySelector( ".gsuiSynthesizer-head" );

		this._attached = true;
		head.style.right = `${ list.offsetWidth - list.clientWidth }px`;
		Array.from( this._nlOscs ).forEach( el => {
			this._uioscs.get( el.dataset.id ).attached();
		} );
	}
	empty() {
		this._uioscs.forEach( o => o.remove() );
		this._uioscs.clear();
		this._nextOscId = 0;
		this.store.oscillators = {};
	}
	setWaveList( arr ) {
		this._waveList = arr;
		this._uioscs.forEach( o => o.addWaves( arr ) );
	}
	change( obj ) {
		if ( obj.oscillators ) {
			Object.entries( obj.oscillators ).forEach( ( [ id, osc ] ) => {
				osc ? this._uioscs.has( id )
					? this._updateOsc( id, osc )
					: this._createOsc( id, osc )
					: this._deleteOsc( id );
			} );
		}
	}

	// private:
	_createOsc( id, osc ) {
		if ( !this._uioscs.has( id ) ) {
			const uiosc = new gsuiOscillator();

			this._nextOscId = Math.max( this._nextOscId, +id + 1 );
			this._uioscs.set( id, uiosc );
			this.store.oscillators[ id ] = Object.assign( {}, osc );
			uiosc.oninput = this._oninputOsc.bind( this, id );
			uiosc.onchange = this._onchangeOsc.bind( this, id );
			uiosc.onremove = this._onremoveOsc.bind( this, id );
			uiosc.addWaves( this._waveList );
			uiosc.change( osc );
			uiosc.rootElement.dataset.id = id;
			uiosc.rootElement.dataset.order = osc.order;
			if ( !Array.from( this._nlOscs ).some( el => {
				if ( osc.order <= +el.dataset.order ) {
					el.before( uiosc.rootElement );
					return true;
				}
			} ) ) {
				this._elNewOsc.before( uiosc.rootElement );
			}
			this._attached && uiosc.attached();
		}
	}
	_updateOsc( id, osc ) {
		this._uioscs.get( id ).change( osc );
	}
	_deleteOsc( id ) {
		const osc = this._uioscs.get( id );

		if ( osc ) {
			osc.remove();
			this._uioscs.delete( id );
			delete this.store.oscillators[ id ];
		}
	}

	// private:
	_getMaxOrder() {
		return 1 + Object.values( this.store.oscillators ).reduce(
			( ord, osc ) => Math.max( ord, osc.order ), 0 );
	}

	// events:
	_onclickNewOsc() {
		const id = `${ this._nextOscId }`,
			osc = {
				order: this._getMaxOrder(),
				type: "sine",
				gain: 1,
				pan: 0,
				detune: 0,
			};

		this._createOsc( id, osc );
		this.onchange( { oscillators: { [ id ]: Object.assign( {}, osc ) } } );
	}
	_oninputOsc( id, attr, val ) {
		this.oninput( id, attr, val );
	}
	_onchangeOsc( id, obj ) {
		Object.assign( this.store.oscillators[ id ], obj );
		this.onchange( { oscillators: { [ id ]: obj } } );
	}
	_onremoveOsc( id ) {
		this._deleteOsc( id );
		this.onchange( { oscillators: { [ id ]: undefined } } );
	}
}

gsuiSynthesizer.template = document.querySelector( "#gsuiSynthesizer-template" );
gsuiSynthesizer.template.remove();
gsuiSynthesizer.template.removeAttribute( "id" );
