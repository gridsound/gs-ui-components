"use strict";

function gsuiSynthesizer() {
	var root = gsuiSynthesizer.template.cloneNode( true );

	this.rootElement = root;
	this.oninput =
	this.onchange = _ => {};
	this._uioscs = {};
	this.empty();

	this._elOscList = root.querySelector( ".gsuiSynthesizer-oscList" );
	root.querySelector( ".gsuiSynthesizer-newOsc" ).onclick = this._onclickNewOsc.bind( this );
	this._onclickNewOsc();
}

gsuiSynthesizer.template = document.querySelector( "#gsuiSynthesizer-template" );
gsuiSynthesizer.template.remove();
gsuiSynthesizer.template.removeAttribute( "id" );

gsuiSynthesizer.prototype = {
	remove() {
		delete this._attached;
		this.rootElement.remove();
	},
	attached() {
		this._attached = true;
		Array.from( this._elOscList.children ).forEach( el => (
			this._uioscs[ el.dataset.id ].attached()
		) );
	},
	empty() {
		Object.values( this._uioscs ).forEach( uiosc => uiosc.remove() );
		this._uioscs = {};
		this._oscIdMax = 0;
		this.store = { oscillators: {} };
	},
	change( obj ) {
		var uioscs = this._uioscs;

		if ( obj.oscillators ) {
			Object.entries( obj.oscillators ).forEach(
				( [ id, osc ] ) => (
					osc ? uioscs[ id ]
						? this._updateOsc( id, osc )
						: this._createOsc( id, osc )
						: this._deleteOsc( id )
				) );
		}
	},

	// private:
	_createOsc( id, osc ) {
		if ( !this._uioscs[ id ] ) {
			var uiosc = new gsuiOscillator();

			this._oscIdMax = Math.max( this._oscIdMax, parseInt( id.substr( 1 ), 16 ) );
			this._uioscs[ id ] = uiosc;
			if ( !( "order" in osc ) ) {
				osc.order = this._getMaxOrder();
			}
			this.store.oscillators[ id ] = Object.assign( {}, osc );
			uiosc.oninput = this._oninputOsc.bind( this, id );
			uiosc.onchange = this._onchangeOsc.bind( this, id );
			uiosc.onremove = this._onremoveOsc.bind( this, id );
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
	},
	_updateOsc( id, osc ) {
		this._uioscs[ id ].change( osc );
	},
	_deleteOsc( id ) {
		var oscs = this._uioscs;

		if ( oscs[ id ] ) {
			oscs[ id ].remove();
			delete oscs[ id ];
			delete this.store.oscillators[ id ];
		}
	},

	// private:
	_getMaxOrder() {
		return 1 + Object.values( this.store.oscillators ).reduce(
			( ord, osc ) => Math.max( ord, osc.order ), 0 );
	},

	// events:
	_onclickNewOsc() {
		var id = "i" + ( this._oscIdMax + 1 ).toString( 16 ),
			osc = {
				type: "sine",
				gain: 1,
				pan: 0,
				detune: 0,
				order: this._getMaxOrder()
			};

		this._createOsc( id, osc );
		this.onchange( { oscillators: { [ id ]: Object.assign( {}, osc ) } } );
	},
	_oninputOsc( id, attr, val ) {
		this.oninput( id, attr, val );
	},
	_onchangeOsc( id, obj ) {
		Object.assign( this.store.oscillators[ id ], obj );
		this.onchange( { oscillators: { [ id ]: obj } } );
	},
	_onremoveOsc( id ) {
		this._deleteOsc( id );
		this.onchange( { oscillators: { [ id ]: null } } );
	}
};
