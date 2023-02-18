"use strict";

class gsuiScrollShadow {
	#topShadow = null;
	#leftShadow = null;
	#rightShadow = null;
	#bottomShadow = null;
	#scrolledElem = null;

	constructor( o ) {
		Object.seal( this );
		this.#scrolledElem = o.scrolledElem;
		this.#topShadow = o.topShadow;
		this.#leftShadow = o.leftShadow;
		this.#rightShadow = o.rightShadow;
		this.#bottomShadow = o.bottomShadow;
		gsuiScrollShadow.#initShadow( this.#topShadow, 'top' );
		gsuiScrollShadow.#initShadow( this.#leftShadow, 'left' );
		gsuiScrollShadow.#initShadow( this.#rightShadow, 'right' );
		gsuiScrollShadow.#initShadow( this.#bottomShadow, 'bottom' );
		this.#scrolledElem.addEventListener( "scroll", this.#onscroll.bind( this ) );
		GSUI.$observeSizeOf( this.#scrolledElem, this.#onresize.bind( this ) );
	}

	// .........................................................................
	static #initShadow( el, dir ) {
		if ( el ) {
			el.classList.add( "gsuiScrollShadow" );
			el.dataset.dir = dir;
		}
	}
	#onresize() {
		this.#onscroll();
	}
	#onscroll() {
		const el = this.#scrolledElem;

		gsuiScrollShadow.#onscroll2( this.#topShadow, el.scrollTop );
		gsuiScrollShadow.#onscroll2( this.#leftShadow, el.scrollLeft );
		gsuiScrollShadow.#onscroll2( this.#rightShadow, el.scrollWidth - el.clientWidth - el.scrollLeft );
		gsuiScrollShadow.#onscroll2( this.#bottomShadow, el.scrollHeight - el.clientHeight - el.scrollTop );
	}
	static #onscroll2( el, scroll ) {
		if ( el ) {
			el.style.setProperty( "--gsuiScrollShadow-dist", `${ Math.min( scroll / 5, 5 ) }px` );
			el.classList.toggle( "gsuiScrollShadow-shadowed", scroll > 0 );
		}
	}
}
