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
		this.#libs.default.setPlaceholder( "loading..." );
		this.#libs.local.setPlaceholder( "drag'n drop your own samples in the app, they will appear here" );
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
