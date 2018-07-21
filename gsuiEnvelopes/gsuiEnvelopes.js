"use strict";

class gsuiEnvelopes {
	constructor() {
		const root = gsuiEnvelopes.template.cloneNode( true ),
			btnEnvs = root.querySelectorAll( ".gsuiEnvelopes-envBtn" ),
			btnDotmode = root.querySelector( ".gsuiEnvelopes-dotLinkBtn" ),
			dotlineWraps = root.querySelectorAll( ".gsuiEnvelopes-line" ),
			[ attDur, relDur ] = root.querySelectorAll( ".gsuiEnvelopes-menuDur" ),
			attDotline = new gsuiDotline(),
			relDotline = new gsuiDotline(),
			attSlider = new gsuiSlider(),
			relSlider = new gsuiSlider(),
			dotlineOpts = {
				step: .01,
				minX: 0,
				minY: 0,
				maxX: 1,
				maxY: 1,
				fixedFirstDot: true,
				fixedLastDot: true,
			};

		this.store = {};
		this.rootElement = root;
		this._attDotline = attDotline;
		this._relDotline = relDotline;
		this._attSlider = attSlider;
		this._relSlider = relSlider;
		this.data = this._createData();
		this.onchange = () => {};

		attDur.before( attSlider.rootElement );
		relDur.before( relSlider.rootElement );
		dotlineWraps[ 0 ].append( attDotline.rootElement );
		dotlineWraps[ 1 ].append( relDotline.rootElement );
		attSlider.options( { type: "linear-x", min: .005, max: 1, step: .005, value: .02 } );
		relSlider.options( { type: "linear-x", min: .005, max: 1, step: .005, value: .02 } );
		attDotline.options( dotlineOpts );
		relDotline.options( dotlineOpts );

		attSlider.oninput = () => attDur.textContent = attSlider.value.toFixed( 3 );
		relSlider.oninput = () => relDur.textContent = relSlider.value.toFixed( 3 );
		attSlider.onchange = this._onchange.bind( this, "attack", "duration" );
		relSlider.onchange = this._onchange.bind( this, "release", "duration" );
		attDotline.onchange = this._onchange.bind( this, "attack", "value" );
		relDotline.onchange = this._onchange.bind( this, "release", "value" );
		btnEnvs.forEach( btn => btn.onclick = this.switchEnv.bind( this, btn.dataset.env ) );
		btnDotmode.onclick = this._onclickDotmode.bind( this );

		this.switchEnv( "gain" );
		attSlider.oninput();
		relSlider.oninput();
	}

	remove() {
		delete this._attached;
		this.rootElement.remove();
	}
	attached() {
		this._attached = true;
		this._attDotline.attached();
		this._relDotline.attached();
		this._attSlider.attached();
		this._relSlider.attached();
	}
	empty() {
	}
	switchEnv( envName ) {
		const env = this.data[ envName ],
			dA = this._attDotline,
			dR = this._relDotline;

		this._currentEnvName =
		this.rootElement.dataset.env = envName;
		if ( envName === "gain" ) {
			dA.options( { minY: 0 } );
			dR.options( { minY: 0 } );
		} else {
			dA.options( { minY: -1 } );
			dR.options( { minY: -1 } );
		}
		dA.setValue( env.attack.value );
		dR.setValue( env.release.value );
		this._attSlider.setValue( env.attack.duration );
		this._relSlider.setValue( env.release.duration );
		this._attSlider.oninput();
		this._relSlider.oninput();
		return false;
	}

	// private:
	_onchange( attRel, prop, val ) {
		this.onchange( { [ this._currentEnvName ]: {
			[ attRel ]: { [ prop ]: val }
		} } );
	}
	_onclickDotmode() {
		const b = this.rootElement.classList.toggle( "gsuiEnvelopes-dotLinked" ) ? "linked" : "free";

		this._attDotline.dotsMoveMode( b );
		this._relDotline.dotsMoveMode( b );
		return false;
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
								? this._attDotline.setValue( val )
								: this._relDotline.setValue( val );
						} else if ( prop === "duration" ) {
							const slider = attRel === "attack"
									? this._attSlider
									: this._relSlider;

							slider.setValue( val );
							slider.oninput();
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
