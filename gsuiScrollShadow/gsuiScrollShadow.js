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
		this.#scrolledElem = $( o.scrolledElem );
		this.#topShadow = $( o.topShadow );
		this.#leftShadow = $( o.leftShadow );
		this.#rightShadow = $( o.rightShadow );
		this.#bottomShadow = $( o.bottomShadow );
		gsuiScrollShadow.#initShadow( this.#topShadow, "top" );
		gsuiScrollShadow.#initShadow( this.#leftShadow, "left" );
		gsuiScrollShadow.#initShadow( this.#rightShadow, "right" );
		gsuiScrollShadow.#initShadow( this.#bottomShadow, "bottom" );
		o.scrolledElem.addEventListener( "scroll", this.#onscrollBind );
		GSUdomObserveSize( o.scrolledElem, this.#onscrollBind );
	}

	// .........................................................................
	$disconnected() {
		GSUdomUnobserveSize( this.#scrolledElem.$get( 0 ), this.#onscrollBind );
	}

	// .........................................................................
	$update() {
		this.#onscroll();
	}
	static #initShadow( elems, dir ) {
		elems.$addClass( "gsuiScrollShadow" ).$setAttr( "data-dir", dir );
	}
	#onscroll() {
		const el = this.#scrolledElem;

		gsuiScrollShadow.#onscroll2( this.#topShadow, el.$scrollY() );
		gsuiScrollShadow.#onscroll2( this.#leftShadow, el.$scrollX() );
		gsuiScrollShadow.#onscroll2( this.#rightShadow, el.$scrollW() - el.$width() - el.$scrollX() );
		gsuiScrollShadow.#onscroll2( this.#bottomShadow, el.$scrollH() - el.$height() - el.$scrollY() );
	}
	static #onscroll2( elems, scroll ) {
		elems.$togClass( "gsuiScrollShadow-shadowed", scroll > 0 )
			.$css( "--gsuiScrollShadow-dist", `${ Math.min( scroll / 5, 5 ) }px` );
	}
}
