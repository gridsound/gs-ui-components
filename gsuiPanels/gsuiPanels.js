"use strict";

class gsuiPanels extends HTMLElement {
	#dir = ""
	#pageN = 0
	#extend = null
	#parent = null
	#panBefore = null
	#panAfter = null
	#parentSize = 0

	constructor() {
		super();

		Object.seal( this );
	}

	// .........................................................................
	connectedCallback() {
		this.#init();
	}

	// .........................................................................
	#init() {
		const qsa = ( c, fn ) => this.querySelectorAll( `.gsuiPanels-${ c }` ).forEach( fn );

		this.style.overflow = "hidden";
		qsa( "extend", el => el.remove() );
		qsa( "last", el => el.classList.remove( "gsuiPanels-last" ) );
		this.#convertFlex( this.classList.contains( "gsuiPanels-x" ) ? "width" : "height", this );
		qsa( "x", this.#convertFlex.bind( this, "width" ) );
		qsa( "y", this.#convertFlex.bind( this, "height" ) );
		qsa( "x > div + div", this.#addExtend.bind( this, "width" ) );
		qsa( "y > div + div", this.#addExtend.bind( this, "height" ) );
	}
	#getChildren( el ) {
		return Array.from( el.children ).filter(
			el => !el.classList.contains( "gsuiPanels-extend" ) );
	}
	#convertFlex( dir, panPar ) {
		const pans = this.#getChildren( panPar ),
			size = dir === "width"
				? panPar.clientWidth
				: panPar.clientHeight;

		pans[ pans.length - 1 ].classList.add( "gsuiPanels-last" );
		pans.map( pan => pan.getBoundingClientRect()[ dir ] )
			.forEach( ( panW, i ) => {
				pans[ i ].style[ dir ] = `${ panW / size * 100 }%`;
			} );
	}
	#addExtend( dir, pan ) {
		const extend = document.createElement( "div" ),
			pans = this.#getChildren( pan.parentNode ),
			panBefore = pans.filter( el => !el.classList.contains( "gsuiPanels-extend" ) &&
				pan.compareDocumentPosition( el ) & Node.DOCUMENT_POSITION_PRECEDING
			).reverse(),
			panAfter = pans.filter( el => !el.classList.contains( "gsuiPanels-extend" ) && (
				pan.compareDocumentPosition( el ) & Node.DOCUMENT_POSITION_FOLLOWING || pan === el
			) );

		extend.className = "gsuiPanels-extend";
		extend.onmousedown = this.#onmousedownExtend.bind( this, dir, extend, panBefore, panAfter );
		pan.append( extend );
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
	#onmousedownExtend( dir, ext, panBefore, panAfter, e ) {
		GSUI.unselectText();
		GSUI.dragshield.show( dir === "width" ? "col-resize" : "row-resize" );
		gsuiPanels._focused = this;
		ext.classList.add( "gsui-hover" );
		this.classList.add( "gsuiPanels-noselect" );
		this.#dir = dir;
		this.#extend = ext;
		this.#pageN = dir === "width" ? e.pageX : e.pageY;
		this.#panBefore = panBefore;
		this.#panAfter = panAfter;
		this.#parent = ext.parentNode.parentNode;
		this.#parentSize = dir === "width"
			? this.#parent.clientWidth
			: this.#parent.clientHeight;
	}
	_onmouseup() {
		GSUI.dragshield.hide();
		this.#extend.classList.remove( "gsui-hover" );
		this.classList.remove( "gsuiPanels-noselect" );
		delete gsuiPanels._focused;
	}
	_onmousemove( e ) {
		const dir = this.#dir,
			px = ( dir === "width" ? e.pageX : e.pageY ) - this.#pageN,
			mov = px - this.#incrSizePans( dir, px, this.#panBefore );

		this.#pageN += mov;
		if ( Math.abs( mov ) > 0 ) {
			this.#incrSizePans( dir, -mov, this.#panAfter );
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
