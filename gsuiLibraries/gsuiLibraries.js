"use strict";

class gsuiLibraries extends HTMLElement {
	#children = GSUI.$getTemplate( "gsui-libraries" );
	#elements = GSUI.$findElements( this.#children, {
		libBtns: ".gsuiLibraries-libBtns",
		libDef: ".gsuiLibraries-default",
		libLoc: ".gsuiLibraries-local",
	} );
	$defaultLocal = this.#elements.libLoc;
	$defaultLibrary = this.#elements.libDef;

	constructor() {
		super();
		Object.seal( this );
		this.#elements.libBtns.onclick = gsuiLibraries.#onclickBtns.bind( null, this );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUI.$recallAttributes( this, { lib: "default" } );
		}
	}

	// .........................................................................
	static #onclickBtns( root, e ) {
		if ( e.target.dataset.lib ) {
			GSUI.$setAttribute( root, "lib", e.target.dataset.lib );
		}
	}
}

Object.freeze( gsuiLibraries );
customElements.define( "gsui-libraries", gsuiLibraries );
