"use strict";

class gsuiSVGPatternsKeys {
	static $render( keys ) {
		const arrKeys = Object.values( keys );
		const { min, size } = gsuiSVGPatternsKeys.#calcMinMax( arrKeys );
		const rowH = GSUroundNum( 1 / ( size + 1 ), 3 );

		return arrKeys.map( k => GSUcreateElementSVG( "rect", {
			x: GSUroundNum( k.when, 3 ),
			y: GSUroundNum( ( size - k.key + min ) * rowH, 3 ),
			width: GSUroundNum( k.duration, 3 ),
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
