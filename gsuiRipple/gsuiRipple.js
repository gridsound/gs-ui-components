"use strict";

class gsuiRipple {
	static #map = new Map();
	static #spaceDown = false;

	static $init( el ) {
		el.$addClass( "gsuiRipple" )
			.$addEventListener( "pointerdown", gsuiRipple.#ptrdown, false )
			.$addEventListener( "keydown", gsuiRipple.#keydown, false )
			.$addEventListener( "keyup", gsuiRipple.#keyup, false );
		gsuiRipple.#map.set( el.$get( 0 ), {} );
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
		const { x, y, w, h } = $( e.currentTarget ).$bcr();

		gsuiRipple.#exec( e,
			( e.clientX - x ) / w,
			( e.clientY - y ) / h,
		);
	}
	static #rmCirc( obj ) {
		if ( obj.$elCirc ) {
			obj.$elCirc.$remove();
		}
		delete obj.$elCirc;
	}
	static #exec( e, x, y ) {
		const el = $( e.currentTarget );
		const obj = gsuiRipple.#map.get( e.currentTarget );
		const circ = $( "<span>" )
			.$addClass( "gsuiRipple-circle" )
			.$addAttr( "inert" )
			.$left( x * 100, "%" )
			.$top( y * 100, "%" )
			.$prependTo( el );

		GSUclearTimeout( obj.$timeoutId );
		gsuiRipple.#rmCirc( obj );
		obj.$elCirc = circ;
		el.$rmAttr( "data-ripple-active" );
		obj.$timeoutId = GSUsetTimeout( () => {
			el.$addAttr( "data-ripple-active" );
			obj.$timeoutId = GSUsetTimeout( () => {
				el.$rmAttr( "data-ripple-active" );
				gsuiRipple.#rmCirc( obj );
			}, .7 );
		}, .01 );
	}
}
