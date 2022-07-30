"use strict";

class gsuiLibraries extends HTMLElement {
	#children = GSUI.$getTemplate( "gsui-libraries" );
	#elements = GSUI.$findElements( this.#children, {
		libBtns: ".gsuiLibraries-libBtns",
		libDef: ".gsuiLibrary-default",
		libLoc: ".gsuiLibrary-local",
	} );
	#libs = {
		default: this.#elements.libDef,
		local: this.#elements.libLoc,
	};

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
	getLibrary( lib ) {
		return this.#libs[ lib ];
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
