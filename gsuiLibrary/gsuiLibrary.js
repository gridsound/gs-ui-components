"use strict";

class gsuiLibrary extends HTMLElement {
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiLibrary" );
	#children = GSUI.$getTemplate( "gsui-library" );
	#elements = GSUI.$findElements( this.#children, {
		body: ".gsuiLibrary-body",
		placeholder: ".gsuiLibrary-placeholder",
	} );
	#map = new Map();

	constructor() {
		super();
		Object.seal( this );
		this.#elements.body.onclick = this.#onclick.bind( this );
		this.#elements.body.ondragstart = this.#ondragstart.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.append( ...this.#children );
			this.#children = null;
		}
	}

	// .........................................................................
	setPlaceholder( str ) {
		this.#elements.placeholder.textContent = str;
	}
	setLibrary( lib ) {
		const el = lib.map( smp => {
			if ( typeof smp !== "string" ) {
				const el = GSUI.$getTemplate( "gsui-library-sample", {
					id: smp[ 0 ],
					points: smp[ 1 ],
					name: smp[ 2 ] || smp[ 0 ],
				} );

				this.#map.set( smp[ 0 ], Object.seal( {
					element: el,
					cursor: null,
					timeout: null,
				} ) );
				return el;
			}
			return GSUI.$getTemplate( "gsui-library-sep", smp );
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
	#expandGroup( elSep ) {
		const exp = !elSep.classList.contains( "gsuiLibrary-sep-expanded" );

		for ( let el = elSep.nextElementSibling; el; el = el.nextElementSibling ) {
			if ( el.classList.contains( "gsuiLibrary-sample" ) ) {
				el.classList.toggle( "gsuiLibrary-sample-expanded", exp );
			} else {
				break;
			}
		}
		elSep.classList.toggle( "gsuiLibrary-sep-expanded", exp );
	}

	// .........................................................................
	#ondragstart( e ) {
		const dt = e.target.dataset;
		const val = `${ dt.id }:${ dt.name }`;

		e.dataTransfer.setData( `library-buffer:${ GSUI.$getAttribute( this, "name" ) }`, val );
	}
	#onclick( e ) {
		const el = e.target;

		if ( el.classList.contains( "gsuiLibrary-sep-btn" ) ) {
			this.#expandGroup( el.parentNode );
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
