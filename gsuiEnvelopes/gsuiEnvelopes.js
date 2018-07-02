"use strict";

class gsuiEnvelopes {
	constructor() {
		const root = gsuiEnvelopes.template.cloneNode( true ),
			btnEnvs = root.querySelectorAll( ".gsuiEnvelopes-envBtn" ),
			btnDotmode = root.querySelector( ".gsuiEnvelopes-dotLinkBtn" ),
			dotlineWraps = root.querySelectorAll( ".gsuiEnvelopes-line" ),
			dotline0 = new gsuiDotline(),
			dotline1 = new gsuiDotline(),
			dotlineOpts = {
				step: .01,
				minX: 0,
				minY: 0,
				maxX: 1,
				maxY: 1,
			};

		this.store = {};
		this.rootElement = root;
		this._dotlineAtt = dotline0;
		this._dotlineRel = dotline1;
		this.data = this._createData();
		this.onchange = () => {};
		dotline0.options( dotlineOpts );
		dotline1.options( dotlineOpts );
		dotline0.onchange = this._onchangeDotline.bind( this, "attack" );
		dotline1.onchange = this._onchangeDotline.bind( this, "release" );
		dotlineWraps[ 0 ].append( dotline0.rootElement );
		dotlineWraps[ 1 ].append( dotline1.rootElement );
		btnEnvs.forEach( btn => btn.onclick = this.switchEnv.bind( this, btn.dataset.env ) );
		btnDotmode.onclick = this._onclickDotmode.bind( this );
		this.switchEnv( "gain" );
	}

	remove() {
		delete this._attached;
		this.rootElement.remove();
	}
	attached() {
		this._attached = true;
		this._dotlineAtt.attached();
		this._dotlineRel.attached();
	}
	empty() {
	}
	switchEnv( envName ) {
		const env = this.data[ envName ],
			dA = this._dotlineAtt,
			dR = this._dotlineRel;

		this._currentEnvName =
		this.rootElement.dataset.env = envName;
		if ( envName === "gain" ) {
			dA.options( { minY: 0, firstLinkedTo: 0, lastLinkedTo: 1 } );
			dR.options( { minY: 0, firstLinkedTo: 1, lastLinkedTo: 0 } );
		} else {
			dA.options( { minY: -1, firstLinkedTo: 0, lastLinkedTo: 0 } );
			dR.options( { minY: -1, firstLinkedTo: 0, lastLinkedTo: 0 } );
		}
		this._dotlineAtt.setValue( env.attack.value );
		this._dotlineRel.setValue( env.release.value );
		return false;
	}

	// private:
	_onclickDotmode() {
		const b = this.rootElement.classList.toggle( "gsuiEnvelopes-dotLinked" ) ? "linked" : "free";

		this._dotlineAtt.dotsMoveMode( b );
		this._dotlineRel.dotsMoveMode( b );
		return false;
	}
	_onchangeDotline( attRel, value ) {
		this.onchange( { [ this._currentEnvName ]: {
			[ attRel ]: { value }
		} } );
	}

	// data proxy
	_createData() {
		return Object.freeze( {
			gain: Object.freeze( {
				attack: this._createProxy( "gain", "attack" ),
				release: this._createProxy( "gain", "release" ),
			} ),
			pan: Object.freeze( {
				attack: this._createProxy( "pan", "attack" ),
				release: this._createProxy( "pan", "release" ),
			} ),
		} );
	}
	_createProxy( envName, attRel ) {
		return new Proxy( Object.seal( {
			value: "",
			duration: 0,
		} ), {
			set: ( tar, prop, val ) => {
				if ( val !== tar[ prop ] ) {
					tar[ prop ] = val;
					if ( envName === this._currentEnvName ) {
						if ( prop === "value" ) {
							attRel === "attack"
								? this._dotlineAtt.setValue( val )
								: this._dotlineRel.setValue( val );
						}
					}
				}
				return true;
			}
		} );
	}
}

gsuiEnvelopes.template = document.querySelector( "#gsuiEnvelopes-template" );
gsuiEnvelopes.template.remove();
gsuiEnvelopes.template.removeAttribute( "id" );
