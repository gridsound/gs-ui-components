"use strict";

class gsuiSlicesforms extends gsuiSVGDefs {
	update( id, slices ) {
		return super.update( id, 1, 1, ...gsuiSlicesforms.#render( slices ) );
	}

	static #render( slices ) {
		return Object.values( slices.slices ).map( gsuiSlicesforms.#renderSlice ).flat( 1 );
	}
	static #renderSlice( sli ) {
		return [
			gsuiSlicesforms.#renderSliceRect( sli, null ),
			gsuiSlicesforms.#renderSliceRect( sli, .25 ),
		];
	}
	static #renderSliceRect( { x, y, w }, opacity ) {
		return GSUI.createElementSVG( "rect", {
			x, y, opacity,
			width: w - .005,
			height: opacity === null ? .05 : 1 - y,
		} );
	}
}

Object.freeze( gsuiSlicesforms );
