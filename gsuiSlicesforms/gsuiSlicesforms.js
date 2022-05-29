"use strict";

class gsuiSlicesforms extends gsuiSVGDefs {
	update( id, slices, dur ) {
		return super.update( id, dur, 1, ...gsuiSlicesforms.#render( slices, dur ) );
	}

	static #render( slices, dur ) {
		return Object.values( slices ).map( sli => [
			gsuiSlicesforms.#renderSliceRect( sli, dur, null ),
			gsuiSlicesforms.#renderSliceRect( sli, dur, .25 ),
		] ).flat( 1 );
	}
	static #renderSliceRect( { x, y, w }, dur, opacity ) {
		return GSUI.$createElementSVG( "rect", {
			x: dur * x,
			y,
			opacity,
			width: dur * ( w - .005 ),
			height: opacity === null ? .05 : 1 - y,
		} );
	}
}

Object.freeze( gsuiSlicesforms );
