"use strict";

class gsuiWaveform {
	static $wfSetPolygonPointsFromBuffer( polygon, w, h, buf, start, dur ) {
		polygon.$setAttr( "points", gsuiWaveform.#getStrPts( w, h, ...gsuiWaveform.#getData( buf, start, dur ) ) );
	}
	static $wfArraysToPolygonPoints( l, r ) {
		return gsuiWaveform.#getStrPts2( l, r );
	}
	static $wfGetPolygonPointsFromBuffer( w, h, buf, start, dur ) {
		return gsuiWaveform.#getStrPts( w, h, ...gsuiWaveform.#getData( buf, start, dur ) );
	}
	static $wfGetArrayFromBuffer( w, buf, start, dur ) {
		return gsuiWaveform.#getArrPts( w, 1, ...gsuiWaveform.#getData( buf, start, dur ) );
	}
	static $wfGetPolygonPointsFromArrays( l, r, sta, dur, bufdur ) {
		const len = l.length;
		const a = sta / bufdur * len | 0;
		const b = dur / bufdur * len | 0;
		const l2 = l.slice( a, a + b );
		const r2 = r.slice( a, a + b );

		return gsuiWaveform.#getStrPts2( l2, r2 );
	}

	// .........................................................................
	static #getData( buf, start, duration ) {
		const d0 = buf.getChannelData( 0 );
		const d1 = buf.numberOfChannels > 1 ? buf.getChannelData( 1 ) : d0;
		const bufdur = buf.duration;
		const sta = start || 0;
		const dur = duration || bufdur - sta;

		return [ d0, d1, bufdur, sta, dur ];
	}

	// .........................................................................
	static #getStrPts( w, h, data0, data1, bufDur, start, dur ) {
		const [ l, r ] = gsuiWaveform.#getArrPts( w, h, data0, data1, bufDur, start, dur );

		return gsuiWaveform.#getStrPts2( l, r );
	}
	static #getStrPts2( l, r ) {
		const len = l.length;
		let dots0 = "";
		let dots1 = "";

		for ( let p = 0; p < len; ++p ) {
			dots0 += ` ${ p },${ gsuiWaveform.#round( l[ p ] ) }`;
			dots1  =  `${ p },${ gsuiWaveform.#round( r[ p ] ) } ${ dots1 }`;
		}
		return `${ dots0 } ${ dots1 }`;
	}
	static #getArrPts( w, h, data0, data1, bufDur, start, dur ) {
		const h2 = h / 2;
		const step = dur / bufDur * data0.length / w;
		const ind = start / bufDur * data0.length | 0;
		const iinc = Math.max( 1, step / 100 ) | 0;
		const dots0 = new Float32Array( w );
		const dots1 = new Float32Array( w );
		let a = true;

		dots0[ 0 ] = gsuiWaveform.#round( h2 - ( data0[ ind ] || 0 ) * h2 );
		dots1[ 0 ] = gsuiWaveform.#round( h2 - ( data1[ ind ] || 0 ) * h2 );
		for ( let p = 1; p < w; ++p ) {
			let lmin = Infinity;
			let rmax = -Infinity;
			let i = ind + ( p - 1 ) * step | 0;
			const iend = i + step;

			for ( ; i < iend; i += iinc ) {
				lmin = Math.min( lmin, data0[ i ] || 0 );
				rmax = Math.max( rmax, data1[ i ] || 0 );
			}
			if ( Math.abs( rmax - lmin ) * h2 < 1 ) {
				rmax += 1 / h;
				lmin -= 1 / h;
			}
			dots0[ p ] = gsuiWaveform.#round( h2 - lmin * h2 );
			dots1[ p ] = gsuiWaveform.#round( h2 - rmax * h2 );
		}
		return [ dots0, dots1 ];
	}

	// .........................................................................
	static #round( n ) {
		return +n.toFixed( 2 );
	}
}
