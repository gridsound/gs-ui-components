"use strict";

class gsuiPanels extends HTMLElement {
	#dir = "";
	#dirX = false;
	#pageN = 0;
	#extend = null;
	#panBefore = null;
	#panAfter = null;

	constructor() {
		super();

		Object.seal( this );
		this.onpointerdown = this.#onpointerdown.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		this.#init();
	}

	// .........................................................................
	#init() {
		const pans = this.children;
		const size = this.#dirX ? this.clientWidth : this.clientHeight;

		this.style.overflow = "hidden";
		this.#dirX = this.classList.contains( "gsuiPanels-x" );
		this.#dir = this.#dirX ? "width" : "height";
		this.querySelectorAll( ".gsuiPanels-extend" ).forEach( el => el.remove() );
		this.querySelectorAll( ".gsuiPanels-last" ).forEach( el => el.classList.remove( "gsuiPanels-last" ) );
		pans[ pans.length - 1 ].classList.add( "gsuiPanels-last" );
		Array.prototype
			.map.call( pans, pan => pan.getBoundingClientRect()[ this.#dir ] )
			.forEach( ( pSize, i ) => {
				pans[ i ].style[ this.#dir ] = `${ pSize / size * 100 }%`;
				if ( i > 0 ) {
					pans[ i ].append( GSUI.$createElement( "div", { class: "gsuiPanels-extend" } ) );
				}
			} );
	}
	static #incrSizePans( dir, mov, parentsize, pans ) {
		return pans.reduce( ( mov, pan ) => {
			let ret = mov;

			if ( Math.abs( mov ) > .1 ) {
				const style = getComputedStyle( pan );
				const size = pan.getBoundingClientRect()[ dir ];
				const minsize = parseFloat( style[ `min-${ dir }` ] ) || 10;
				const maxsize = parseFloat( style[ `max-${ dir }` ] ) || Infinity;
				const newsizeCorrect = Math.max( minsize, Math.min( size + mov, maxsize ) );

				if ( Math.abs( newsizeCorrect - size ) >= .1 ) {
					pan.style[ dir ] = `${ newsizeCorrect / parentsize * 100 }%`;
					ret -= newsizeCorrect - size;
					if ( pan.onresizing ) {
						pan.onresizing( pan );
					}
				}
			}
			return ret;
		}, mov );
	}

	// .........................................................................
	#onpointerdown( e ) {
		const tar = e.target;
		const pan = tar.parentNode;

		if ( pan.parentNode === this && tar.classList.contains( "gsuiPanels-extend" ) ) {
			this.#extend = tar;
			this.#pageN = this.#dirX ? e.pageX : e.pageY;
			this.#panBefore = Array.prototype.filter.call( this.children, el =>
				pan.compareDocumentPosition( el ) & Node.DOCUMENT_POSITION_PRECEDING
			).reverse();
			this.#panAfter = Array.prototype.filter.call( this.children, el =>
				pan === el || pan.compareDocumentPosition( el ) & Node.DOCUMENT_POSITION_FOLLOWING
			);
			this.style.cursor = this.#dirX ? "col-resize" : "row-resize";
			tar.classList.add( "gsui-hover" );
			GSUI.$unselectText();
			this.setPointerCapture( e.pointerId );
			this.onpointerup = this.#onpointerup.bind( this );
			this.onpointermove = this.#onpointermove.bind( this );
		}
	}
	#onpointerup( e ) {
		this.style.cursor = "";
		this.#extend.classList.remove( "gsui-hover" );
		this.releasePointerCapture( e.pointerId );
		this.onpointermove =
		this.onpointerup = null;
	}
	#onpointermove( e ) {
		const px = ( this.#dirX ? e.pageX : e.pageY ) - this.#pageN;
		const parentsize = this.#dirX ? this.clientWidth : this.clientHeight;
		const mov = px - gsuiPanels.#incrSizePans( this.#dir, px, parentsize, this.#panBefore );

		this.#pageN += mov;
		if ( Math.abs( mov ) > 0 ) {
			gsuiPanels.#incrSizePans( this.#dir, -mov, parentsize, this.#panAfter );
		}
	}
}

Object.freeze( gsuiPanels );
customElements.define( "gsui-panels", gsuiPanels );
