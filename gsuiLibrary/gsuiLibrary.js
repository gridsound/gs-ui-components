"use strict";

class gsuiLibrary extends HTMLElement {
	#children = GSUI.$getTemplate( "gsui-library" );
	#elements = GSUI.$findElements( this.#children, {
		body: ".gsuiLibrary-body",
	} );

	constructor() {
		super();
		Object.seal( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.append( ...this.#children );
			this.#children = null;
		}
	}

	// .........................................................................
	setLibrary( lib ) {
		const el = lib.map( item => {
			return typeof item !== "string"
				? GSUI.$getTemplate( "gsui-library-sample", { title: item[ 0 ], points: item[ 1 ], viewBox: "0 0 40 10" } )
				: GSUI.$getTemplate( "gsui-library-sep", item );
		} );

		this.#elements.body.append( ...el );
	}
}

Object.freeze( gsuiLibrary );
customElements.define( "gsui-library", gsuiLibrary );
