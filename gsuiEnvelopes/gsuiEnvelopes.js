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

		this.rootElement = root;
		this.store = {};
		this._dotlineAtt = dotline0;
		this._dotlineRel = dotline1;
		dotline0.options( dotlineOpts );
		dotline1.options( dotlineOpts );
		dotline0.lastDotLinkedTo( 1 );
		dotline1.firstDotLinkedTo( 1 );
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
		this.rootElement.dataset.env = envName;
		return false;
	}

	// private:
	_onclickDotmode() {
		const b = this.rootElement.classList.toggle( "gsuiEnvelopes-dotLinked" ) ? "linked" : "free";

		this._dotlineAtt.dotsMoveMode( b );
		this._dotlineRel.dotsMoveMode( b );
		return false;
	}
}

gsuiEnvelopes.template = document.querySelector( "#gsuiEnvelopes-template" );
gsuiEnvelopes.template.remove();
gsuiEnvelopes.template.removeAttribute( "id" );
