"use strict";

class gsuiSVGPatternsKeys {
	static $render( keys ) {
		const arrKeys = Object.values( keys );
		const { min, size } = gsuiSVGPatternsKeys.#calcMinMax( arrKeys );
		const rowH = GSUI.$round( 1 / ( size + 1 ), 3 );

		return arrKeys.map( k => GSUI.$createElementSVG( "rect", {
			x: GSUI.$round( k.when, 3 ),
			y: GSUI.$round( ( size - k.key + min ) * rowH, 3 ),
			width: GSUI.$round( k.duration, 3 ),
			height: rowH,
		} ) );
	}
	static #calcMinMax( arrKeys ) {
		let min = Infinity;
		let max = -Infinity;

		arrKeys.forEach( k => {
			min = Math.min( min, k.key );
			max = Math.max( max, k.key );
		} );
		min -= min % 12;
		max += 11 - max % 12;
		return { min, size: max - min };
	}
}

Object.freeze( gsuiSVGPatternsKeys );
