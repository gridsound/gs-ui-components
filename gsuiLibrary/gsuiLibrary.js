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
	loadSample( id ) {
		const el = this.#getSample( id );

		el.classList.add( "gsuiLibrary-sample-loading" );
		el.title = "loading...";
	}
	unloadSample( id ) {
		const el = this.#getSample( id );

		el.classList.remove( "gsuiLibrary-sample-loading", "gsuiLibrary-sample-ready" );
		el.title = el.dataset.id;
	}
	readySample( id ) {
		const el = this.#getSample( id );

		el.classList.remove( "gsuiLibrary-sample-loading" );
		el.classList.add( "gsuiLibrary-sample-ready" );
		el.title = el.dataset.id;
	}

	// .........................................................................
	#getSample( id ) {
		return this.#elements.body.querySelector( `[data-id="${ id }"]` );
	}
	#onclick( e ) {
		const el = e.target;

		if ( el.dataset.id && !el.classList.contains( "gsuiLibrary-sample-loading" ) ) {
			const act = el.classList.contains( "gsuiLibrary-sample-ready" )
				? "playSample"
				: "loadSample";

			this.#dispatch( act, el.dataset.id );
		}
	}
}

Object.freeze( gsuiLibrary );
customElements.define( "gsui-library", gsuiLibrary );
