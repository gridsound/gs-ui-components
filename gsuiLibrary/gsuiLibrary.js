"use strict";

class gsuiLibrary extends HTMLElement {
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiLibrary" );
	#children = GSUI.$getTemplate( "gsui-library" );
	#elements = GSUI.$findElements( this.#children, {
		body: ".gsuiLibrary-body",
	} );

	constructor() {
		super();
		Object.seal( this );
		this.#elements.body.onclick = this.#onclick.bind( this );
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
	loadSample( id, b ) {
		const elSmp = this.#getSample( id );

		elSmp.classList.toggle( "gsuiLibrary-sample-loading", b );
		if ( b ) {
			elSmp.title += ' (loading...)';
		} else if ( elSmp.title.endsWith( ' (loading...)' ) ) {
			elSmp.title = elSmp.title.slice( 0, -13 );
		}
	}

	// .........................................................................
	#getSample( id ) {
		return this.#elements.body.querySelector( `[data-id="${ id }"]` );
	}
	#onclick( e ) {
		if ( e.target.dataset.id && !e.target.classList.contains( "gsuiLibrary-sample-loading" ) ) {
			this.#dispatch( "clickSample", e.target.dataset.id );
		}
	}
}

Object.freeze( gsuiLibrary );
customElements.define( "gsui-library", gsuiLibrary );
