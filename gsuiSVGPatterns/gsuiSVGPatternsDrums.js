"use strict";

class gsuiSVGPatternsDrums {
	static $render( drums, drumrows, sPB ) {
		const rowsArr = Object.entries( drumrows );
		const drmW = 1 / sPB;
		const drmH = 1 / rowsArr.length;
		const orders = rowsArr
			.sort( ( a, b ) => a[ 1 ].order - b[ 1 ].order )
			.reduce( ( obj, [ id ], i ) => {
				obj[ id ] = i;
				return obj;
			}, {} );

		return Object.values( drums )
			.map( d => ( "gain" in d
				? gsuiSVGPatternsDrums.#createDrum
				: gsuiSVGPatternsDrums.#createDrumcut )( d.when, orders[ d.row ] * drmH, drmW, drmH ) );
	}
	static #createDrum( x, y, w, h ) {
		return GSUcreateElementSVG( "polygon", {
			points: GSUmathFix( [ x, y, x, y + h * .75, x + w, y + h * .75 / 2 ], 3 ).join( "," ),
		} );
	}
	static #createDrumcut( x, y, w, h ) {
		return GSUcreateElementSVG( "rect", {
			x: GSUmathFix( x, 3 ),
			y: GSUmathFix( y + h * .8, 3 ),
			width: GSUmathFix( w * .9, 3 ),
			height: GSUmathFix( h * .2, 3 ),
		} );
	}
}

Object.freeze( gsuiSVGPatternsDrums );
