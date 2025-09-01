"use strict";

class gsuiSVGPatternsSlices {
	static $render( slices, dur ) {
		return Object.values( slices ).map( sli => [
			gsuiSVGPatternsSlices.#renderSliceRect( sli, dur, null ),
			gsuiSVGPatternsSlices.#renderSliceRect( sli, dur, .25 ),
		] ).flat( 1 );
	}
	static #renderSliceRect( { x, y, w }, dur, opacity ) {
		return GSUcreateElement( "rect", {
			x: dur * x,
			y,
			opacity,
			width: dur * ( w - .005 ),
			height: opacity === null ? .05 : 1 - y,
		} );
	}
}

Object.freeze( gsuiSVGPatternsSlices );
