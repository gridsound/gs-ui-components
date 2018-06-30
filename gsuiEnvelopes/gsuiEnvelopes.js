"use strict";

class gsuiEnvelopes {
	constructor() {
		const root = gsuiEnvelopes.template.cloneNode( true ),
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
		this._dotlineAttack = dotline0;
		this._dotlineRelease = dotline1;
		dotline0.options( dotlineOpts );
		dotline1.options( dotlineOpts );
		dotline0.lastDotLinkedTo( 1 );
		dotline1.firstDotLinkedTo( 1 );
		dotlineWraps[ 0 ].append( dotline0.rootElement );
		dotlineWraps[ 1 ].append( dotline1.rootElement );
	}

	remove() {
		delete this._attached;
		this.rootElement.remove();
	}
	attached() {
		this._attached = true;
		this._dotlineAttack.attached();
		this._dotlineRelease.attached();
	}
	empty() {

	}
}

gsuiEnvelopes.template = document.querySelector( "#gsuiEnvelopes-template" );
gsuiEnvelopes.template.remove();
gsuiEnvelopes.template.removeAttribute( "id" );
