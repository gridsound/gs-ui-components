"use strict";

class gsuiLibrary extends HTMLElement {
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiLibrary" );
	#children = GSUI.$getTemplate( "gsui-library" );
	#elements = GSUI.$findElements( this.#children, {
		body: ".gsuiLibrary-body",
	} );
	#map = new Map();

	constructor() {
		super();
		Object.seal( this );
		this.#elements.body.onclick = this.#onclick.bind( this );
		this.#elements.body.ondragstart = gsuiLibrary.#ondragstart;
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
			if ( typeof item !== "string" ) {
				const el = GSUI.$getTemplate( "gsui-library-sample", { title: item[ 0 ], points: item[ 1 ], viewBox: "0 0 40 10" } );

				this.#map.set( item[ 0 ], Object.seal( {
					element: el,
					cursor: null,
					timeout: null,
				} ) );
				return el;
			}
			return GSUI.$getTemplate( "gsui-library-sep", item );
		} );

		this.#elements.body.append( ...el );
	}
	loadSample( id ) {
		const smp = this.#map.get( id );

		smp.element.classList.add( "gsuiLibrary-sample-loading" );
		smp.element.title = "loading...";
	}
	unloadSample( id ) {
		const smp = this.#map.get( id );

		smp.element.classList.remove( "gsuiLibrary-sample-loading", "gsuiLibrary-sample-ready" );
		smp.element.title = smp.element.dataset.id;
	}
	readySample( id ) {
		const smp = this.#map.get( id );

		smp.element.classList.remove( "gsuiLibrary-sample-loading" );
		smp.element.classList.add( "gsuiLibrary-sample-ready" );
		smp.element.title = smp.element.dataset.id;
	}
	playSample( id, dur ) {
		const smp = this.#map.get( id );

		this.stopSample( id );
		smp.element.classList.add( "gsuiLibrary-sample-playing" );
		smp.cursor = GSUI.$createElement( "div", { class: "gsuiLibrary-sample-cursor" } );
		smp.cursor.style.left = "0%";
		smp.cursor.style.transitionDuration = `${ dur }s`;
		smp.element.append( smp.cursor );
		setTimeout( () => smp.cursor.style.left = "100%", 10 );
		smp.timeout = setTimeout( this.stopSample.bind( this, id ), dur * 1000 );
	}
	stopSample( id ) {
		const smp = this.#map.get( id );

		clearTimeout( smp.timeout );
		smp.cursor?.remove();
		smp.element.classList.remove( "gsuiLibrary-sample-playing" );
	}

	// .........................................................................
	#expandGroup( id ) {
		const gr = this.querySelector( `.gsuiLibrary-sep[data-id="${ id }"]` );
		const exp = !gr.classList.contains( "gsuiLibrary-sep-expanded" );

		for ( let el = gr.nextElementSibling; el; el = el.nextElementSibling ) {
			if ( el.classList.contains( "gsuiLibrary-sample" ) ) {
				el.classList.toggle( "gsuiLibrary-sample-expanded", exp );
			} else {
				break;
			}
		}
		gr.classList.toggle( "gsuiLibrary-sep-expanded", exp );
	}

	// .........................................................................
	static #ondragstart( e ) {
		e.dataTransfer.setData( "library-buffer", e.target.dataset.id );
	}
	#onclick( e ) {
		const el = e.target;

		if ( el.classList.contains( "gsuiLibrary-sep-btn" ) ) {
			this.#expandGroup( el.parentNode.dataset.id );
		} else if ( el.classList.contains( "gsuiLibrary-sample" ) ) {
			if ( !el.classList.contains( "gsuiLibrary-sample-loading" ) ) {
				const act = el.classList.contains( "gsuiLibrary-sample-ready" )
					? "playSample"
					: "loadSample";

				this.#dispatch( act, el.dataset.id );
			}
		}
	}
}

Object.freeze( gsuiLibrary );
customElements.define( "gsui-library", gsuiLibrary );
