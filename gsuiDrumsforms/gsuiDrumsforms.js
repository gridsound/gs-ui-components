"use strict";

class gsuiDrumsforms extends gsuiSVGDefs {
	update( id, drums, drumrows, dur, stepsPerBeat ) {
		return super.update( id, dur, 1, ...gsuiDrumsforms._render( drums, drumrows, stepsPerBeat ) );
	}

	static _render( drums, drumrows, sPB ) {
		const rowsArr = Object.entries( drumrows ),
			drmW = 1 / sPB,
			drmH = 1 / rowsArr.length,
			orders = rowsArr
				.sort( ( a, b ) => a[ 1 ].order - b[ 1 ].order )
				.reduce( ( obj, [ id ], i ) => {
					obj[ id ] = i;
					return obj;
				}, {} );

		return Object.values( drums )
			.map( d => gsuiDrumsforms._createDrum( d.when, orders[ d.row ], drmW, drmH ), [] );
	}
	static _createDrum( x, y, w, h ) {
		const pol = gsuiSVGDefs.create( "polygon" ),
			yy = y * h,
			mg = h / 7;

		pol.setAttribute( "points", `
			${ x },${ yy + mg }
			${ x },${ yy + h - mg }
			${ x + w },${ yy + h / 2 }
		` );
		return pol;
	}
}
