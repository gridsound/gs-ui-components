"use strict";

class gsuiDrumsforms extends gsuiSVGDefs {
	update( id, drums, drumrows, dur, stepsPerBeat ) {
		return super.update( id, dur, 1, ...gsuiDrumsforms.#render( drums, drumrows, stepsPerBeat ) );
	}

	static #render( drums, drumrows, sPB ) {
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
				? gsuiDrumsforms.#createDrum
				: gsuiDrumsforms.#createDrumcut )( d.when, orders[ d.row ] * drmH, drmW, drmH ) );
	}
	static #createDrum( x, y, w, h ) {
		return GSUI.$createElementSVG( "polygon", {
			points: [ x, y, x, y + h * .75, x + w, y + h * .75 / 2 ].join( "," ),
		} );
	}
	static #createDrumcut( x, y, w, h ) {
		return GSUI.$createElementSVG( "rect", {
			x,
			y: y + h * .8,
			width: w * .9,
			height: h * .2,
		} );
	}
}

Object.freeze( gsuiDrumsforms );
