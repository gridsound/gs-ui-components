"use strict";

class gsuiSynthesizer {
	constructor() {
		const root = gsuiSynthesizer.template.cloneNode( true );

		this.rootElement = root;
		this._waveList = [];
		this._elOscList = root.querySelector( ".gsuiSynthesizer-oscList" );
		this.oninput =
		this.onchange = () => {};
		root.querySelector( ".gsuiSynthesizer-newOsc" ).onclick = this._onclickNewOsc.bind( this );
		this.empty();
	}

	remove() {
		delete this._attached;
		this.rootElement.remove();
	}
	attached() {
		this._attached = true;
		Array.from( this._elOscList.children ).forEach( el => (
			this._uioscs[ el.dataset.id ].attached()
		) );
	}
	empty() {
		this._uioscs && Object.values( this._uioscs ).forEach( o => o.remove() );
		this._uioscs = {};
		this._nextOscId = 0;
		this.store = { oscillators: {} };
	}
	setWaveList( arr ) {
		this._waveList = arr;
		Array.from( this._uioscs ).forEach( o => o.addWaves( arr ) );
	}
	change( obj ) {
		const uioscs = this._uioscs;

		if ( obj.oscillators ) {
			Object.entries( obj.oscillators ).forEach( ( [ id, osc ] ) => (
				osc ? uioscs[ id ]
					? this._updateOsc( id, osc )
					: this._createOsc( id, osc )
					: this._deleteOsc( id )
			) );
		}
	}

	// private:
	_createOsc( id, osc ) {
		if ( !this._uioscs[ id ] ) {
			const uiosc = new gsuiOscillator();

			this._nextOscId = Math.max( this._nextOscId, +id + 1 );
			this._uioscs[ id ] = uiosc;
			if ( !( "order" in osc ) ) {
				osc.order = this._getMaxOrder();
			}
			this.store.oscillators[ id ] = Object.assign( {}, osc );
			uiosc.oninput = this._oninputOsc.bind( this, id );
			uiosc.onchange = this._onchangeOsc.bind( this, id );
			uiosc.onremove = this._onremoveOsc.bind( this, id );
			uiosc.addWaves( this._waveList );
			uiosc.change( osc );
			uiosc.rootElement.dataset.id = id;
			uiosc.rootElement.dataset.order = "order" in osc ? osc.order : this._getMaxOrder();
			if ( !Array.from( this._elOscList.children ).some( el => {
				if ( osc.order <= +el.dataset.order ) {
					el.before( uiosc.rootElement );
					return true;
				}
			} ) ) {
				this._elOscList.append( uiosc.rootElement );
			}
			this._attached && uiosc.attached();
		}
	}
	_updateOsc( id, osc ) {
		this._uioscs[ id ].change( osc );
	}
	_deleteOsc( id ) {
		const oscs = this._uioscs;

		if ( oscs[ id ] ) {
			oscs[ id ].remove();
			delete oscs[ id ];
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
		const id = this._nextOscId + "",
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
