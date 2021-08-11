"use strict";

class gsuiPanels extends HTMLElement {
	#dir = ""
	#dirX = false
	#pageN = 0
	#extend = null
	#panBefore = null
	#panAfter = null
	#parentSize = 0

	constructor() {
		super();

		Object.seal( this );
		this.onmousedown = this.#onmousedown.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		this.#init();
	}

	// .........................................................................
	#init() {
		const pans = this.children,
			size = this.#dirX ? this.clientWidth : this.clientHeight;

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
					pans[ i ].append( GSUI.createElement( "div", { class: "gsuiPanels-extend" } ) );
				}
			} );
	}
	#incrSizePans( dir, mov, pans ) {
		const parentsize = this.#parentSize;

		return pans.reduce( ( mov, pan ) => {
			let ret = mov;

			if ( Math.abs( mov ) > .1 ) {
				const style = getComputedStyle( pan ),
					size = pan.getBoundingClientRect()[ dir ],
					minsize = parseFloat( style[ `min-${ dir }` ] ) || 10,
					maxsize = parseFloat( style[ `max-${ dir }` ] ) || Infinity,
					newsizeCorrect = Math.max( minsize, Math.min( size + mov, maxsize ) );

				if ( Math.abs( newsizeCorrect - size ) >= .1 ) {
					pan.style[ dir ] = `${ newsizeCorrect / parentsize * 100 }%`;
					if ( mov > 0 ) {
						ret = mov - ( newsizeCorrect - size );
					} else {
						ret = mov + ( size - newsizeCorrect );
					}
					if ( pan.onresizing ) {
						pan.onresizing( pan );
					}
				}
			}
			return ret;
		}, mov );
	}

	// .........................................................................
	#onmousedown( e ) {
		const tar = e.target,
			pan = tar.parentNode;

		if ( pan.parentNode === this && tar.classList.contains( "gsuiPanels-extend" ) ) {
			GSUI.unselectText();
			GSUI.dragshield.show( this.#dirX ? "col-resize" : "row-resize" );
			gsuiPanels._focused = this;
			tar.classList.add( "gsui-hover" );
			this.#extend = tar;
			this.#pageN = this.#dirX ? e.pageX : e.pageY;
			this.#parentSize = this.#dirX ? this.clientWidth : this.clientHeight;
			this.#panBefore = Array.prototype.filter.call( this.children, el => (
				pan.compareDocumentPosition( el ) & Node.DOCUMENT_POSITION_PRECEDING
			) ).reverse();
			this.#panAfter = Array.prototype.filter.call( this.children, el => (
				pan === el || pan.compareDocumentPosition( el ) & Node.DOCUMENT_POSITION_FOLLOWING
			) );
		}
	}
	_onmouseup() {
		GSUI.dragshield.hide();
		this.#extend.classList.remove( "gsui-hover" );
		delete gsuiPanels._focused;
	}
	_onmousemove( e ) {
		const px = ( this.#dirX ? e.pageX : e.pageY ) - this.#pageN,
			mov = px - this.#incrSizePans( this.#dir, px, this.#panBefore );

		this.#pageN += mov;
		if ( Math.abs( mov ) > 0 ) {
			this.#incrSizePans( this.#dir, -mov, this.#panAfter );
		}
	}
}

document.addEventListener( "mousemove", e => {
	gsuiPanels._focused && gsuiPanels._focused._onmousemove( e );
} );
document.addEventListener( "mouseup", e => {
	gsuiPanels._focused && gsuiPanels._focused._onmouseup( e );
} );

// Object.freeze( gsuiPanels );

customElements.define( "gsui-panels", gsuiPanels );
