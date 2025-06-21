"use strict";

class gsuiRipple {
	static #map = new Map();
	static #spaceDown = false;

	static $init( el ) {
		el.classList.add( "gsuiRipple" );
		el.addEventListener( "pointerdown", gsuiRipple.#ptrdown, false );
		el.addEventListener( "keydown", gsuiRipple.#keydown, false );
		el.addEventListener( "keyup", gsuiRipple.#keyup, false );
		gsuiRipple.#map.set( el, {} );
	}

	static #keydown( e ) {
		if ( e.key === " " && !gsuiRipple.#spaceDown ) {
			gsuiRipple.#spaceDown = true;
			gsuiRipple.#exec( e, .5, .5 );
		}
	}
	static #keyup( e ) {
		if ( e.key === " " ) {
			gsuiRipple.#spaceDown = false;
		}
	}
	static #ptrdown( e ) {
		const el = e.currentTarget;
		const [ x, y, w, h ] = GSUdomBCRxywh( el );

		gsuiRipple.#exec( e,
			( e.clientX - x ) / w,
			( e.clientY - y ) / h,
		);
	}
	static #exec( e, x, y ) {
		const el = e.currentTarget;
		const obj = gsuiRipple.#map.get( el );
		const circ = GSUcreateSpan( { class: "gsuiRipple-circle", style: {
			left: `${ x * 100 }%`,
			top: `${ y * 100 }%`,
		} } );

		GSUclearTimeout( obj.$timeoutId );
		if ( obj.$elCirc ) {
			obj.$elCirc.remove();
		}
		obj.$elCirc = circ;
		el.prepend( circ );
		GSUdomRmAttr( el, "data-ripple-active" );
		obj.$timeoutId = GSUsetTimeout( () => {
			GSUdomSetAttr( el, "data-ripple-active" );
			obj.$timeoutId = GSUsetTimeout( () => {
				GSUdomRmAttr( el, "data-ripple-active" );
				circ.remove();
			}, .7 );
		}, .1 );
	}
}
