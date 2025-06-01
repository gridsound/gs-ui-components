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
		const bcr = el.getBoundingClientRect();

		gsuiRipple.#exec( e,
			( e.clientX - bcr.left ) / bcr.width,
			( e.clientY - bcr.top ) / bcr.height,
		);
	}
	static #exec( e, x, y ) {
		const el = e.currentTarget;
		const obj = gsuiRipple.#map.get( el );
		const circ = GSUcreateSpan( { class: "gsuiRipple-circle", style: {
			left: `${ x * 100 }%`,
			top: `${ y * 100 }%`,
		} } );

		clearTimeout( obj.$timeoutId );
		if ( obj.$elCirc ) {
			obj.$elCirc.remove();
		}
		obj.$elCirc = circ;
		el.prepend( circ );
		el.classList.remove( "gsuiRipple-active" );
		obj.$timeoutId = GSUsetTimeout( () => {
			el.classList.add( "gsuiRipple-active" );
			obj.$timeoutId = GSUsetTimeout( () => {
				el.classList.remove( "gsuiRipple-active" );
				circ.remove();
			}, .7 );
		}, .1 );
	}
}
