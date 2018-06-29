"use strict";

class gsuiEnvelopes {
	constructor() {
		const root = gsuiEnvelopes.template.cloneNode( true );

		this.rootElement = root;
		this.store = {};
	}

	remove() {
		delete this._attached;
		this.rootElement.remove();
	}
	attached() {
		this._attached = true;
	}
	empty() {

	}
}

gsuiEnvelopes.template = document.querySelector( "#gsuiEnvelopes-template" );
gsuiEnvelopes.template.remove();
gsuiEnvelopes.template.removeAttribute( "id" );
