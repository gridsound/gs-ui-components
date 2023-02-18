"use strict";

class gsuiScrollShadow {
	#scrolledElem = null;
	#topShadow = null;
	#leftShadow = null;
	#rightShadow = null;
	#bottomShadow = null;
	#onscrollBind = this.#onscroll.bind( this );

	constructor( o ) {
		Object.seal( this );
		this.#scrolledElem = o.scrolledElem;
		this.#topShadow = o.topShadow ? [ o.topShadow ].flat() : [];
		this.#leftShadow = o.leftShadow ? [ o.leftShadow ].flat() : [];
		this.#rightShadow = o.rightShadow ? [ o.rightShadow ].flat() : [];
		this.#bottomShadow = o.bottomShadow ? [ o.bottomShadow ].flat() : [];
		gsuiScrollShadow.#initShadow( this.#topShadow, 'top' );
		gsuiScrollShadow.#initShadow( this.#leftShadow, 'left' );
		gsuiScrollShadow.#initShadow( this.#rightShadow, 'right' );
		gsuiScrollShadow.#initShadow( this.#bottomShadow, 'bottom' );
		this.#scrolledElem.addEventListener( "scroll", this.#onscrollBind );
		GSUI.$observeSizeOf( this.#scrolledElem, this.#onscrollBind );
		const arr = [];
	}

	// .........................................................................
	static #initShadow( elems, dir ) {
		elems.forEach( el => {
			el.classList.add( "gsuiScrollShadow" );
			el.dataset.dir = dir;
		} );
	}
	#onscroll() {
		const el = this.#scrolledElem;

		gsuiScrollShadow.#onscroll2( this.#topShadow, el.scrollTop );
		gsuiScrollShadow.#onscroll2( this.#leftShadow, el.scrollLeft );
		gsuiScrollShadow.#onscroll2( this.#rightShadow, el.scrollWidth - el.clientWidth - el.scrollLeft );
		gsuiScrollShadow.#onscroll2( this.#bottomShadow, el.scrollHeight - el.clientHeight - el.scrollTop );
	}
	static #onscroll2( elems, scroll ) {
		elems.forEach( el => {
			el.style.setProperty( "--gsuiScrollShadow-dist", `${ Math.min( scroll / 5, 5 ) }px` );
			el.classList.toggle( "gsuiScrollShadow-shadowed", scroll > 0 );
		} );
	}
}
