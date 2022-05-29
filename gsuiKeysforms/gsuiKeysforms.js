"use strict";

class gsuiKeysforms extends gsuiSVGDefs {
	update( id, keys, dur ) {
		return super.update( id, dur, 1, ...gsuiKeysforms.#render( keys ) );
	}

	static #render( keys ) {
		const arrKeys = Object.values( keys );
		const { min, size } = gsuiKeysforms.#calcMinMax( arrKeys );
		const rowH = 1 / ( size + 1 );

		return arrKeys.map( k => GSUI.$createElementSVG( "rect", {
			x: k.when,
			y: ( size - k.key + min ) * rowH,
			width: k.duration,
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

Object.freeze( gsuiKeysforms );
