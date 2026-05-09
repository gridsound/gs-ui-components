"use strict";

class gsuiRipple {
	static #map = new Map();

	static $init( elClick, elCirclePar ) {
		gsuiRipple.#init2( elClick, elCirclePar || elClick );
	}
	static #init2( elClick, elCirclePar ) {
		elCirclePar.$addClass( "gsuiRipple" );
		elClick
			.$addEventListener( "pointerdown", gsuiRipple.#ptrdown, false )
			.$addEventListener( "keydown", gsuiRipple.#keydown, false );
		gsuiRipple.#map.set( elClick.$get( 0 ), { $elCirclePar: elCirclePar } );
	}

	static #keydown( e ) {
		if ( e.key === " " && !e.repeat ) {
			gsuiRipple.#exec( e, .5, .5 );
		}
	}
	static #ptrdown( e ) {
		const { x, y, w, h } = $.$bcr( e.currentTarget );

		gsuiRipple.#exec( e,
			( e.clientX - x ) / w,
			( e.clientY - y ) / h,
		);
	}
	static #rmCirc( obj ) {
		obj.$elCirc?.$remove();
		delete obj.$elCirc;
	}
	static #exec( e, x, y ) {
		const obj = gsuiRipple.#map.get( e.currentTarget );
		const el = obj.$elCirclePar;
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
