"use strict";

class gsuiKeysforms extends gsuiSVGDefs {
	update( id, keys, dur ) {
		return super.update( id, dur, 1, ...gsuiKeysforms.#render( keys ) );
	}

	static #render( keys ) {
		const arrKeys = Object.values( keys ),
			{ min, size } = gsuiKeysforms.#calcMinMax( arrKeys ),
			rowH = 1 / ( size + 1 );

		return arrKeys.map( k => {
			const rect = gsuiSVGDefs.create( "rect" );

			rect.setAttribute( "x", k.when );
			rect.setAttribute( "y", ( size - k.key + min ) * rowH );
			rect.setAttribute( "width", k.duration );
			rect.setAttribute( "height", rowH );
			return rect;
		}, [] );
	}
	static #calcMinMax( arrKeys ) {
		let min = Infinity,
			max = -Infinity;

		arrKeys.forEach( k => {
			min = Math.min( min, k.key );
			max = Math.max( max, k.key );
		} );
		min -= min % 12;
		max += 11 - max % 12;
		return { min, size: max - min };
	}
}
