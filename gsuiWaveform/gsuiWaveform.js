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
	static $getPathChans( buf, w, h, start, duration ) {
		const bufDur = buf.duration;
		const sta = start ?? 0;
		const dur = duration ?? bufDur;
		const chanL = buf.getChannelData( 0 );
		const chanR = buf.numberOfChannels > 1 ? buf.getChannelData( 1 ) : "";

		return [
			gsuiWaveform.$getPathChan( w, h, chanL, bufDur, sta, dur ).join( "," ),
			chanR && gsuiWaveform.$getPathChan( w, h, chanR, bufDur, sta, dur ).join( "," ),
		];
	}
	static $getPathChan( w, h, data, bufDur, start, dur ) {
		const sampleRate = data.length / bufDur;
		const startSample = start * sampleRate;
		const spp = dur * sampleRate / w;

		return spp < 1
			? gsuiWaveform.$getPathPerSample( h, data, startSample, spp, w )
			: gsuiWaveform.$getPathPerGroup( h, data, startSample, spp, w );
	}
	static $getPathPerGroup( h, data, startSample, spp, w ) {
		const h2 = h / 2;
		const grpSize = Math.max( 1, Math.round( spp ) );
		const grpFirst = Math.floor( startSample / grpSize ) - 1;
		const grpLast = Math.ceil( ( startSample + spp * w ) / grpSize ) + 1;
		const arrA = [];
		const arrB = [];

		for ( let k = grpFirst; k <= grpLast; ++k ) {
			const a = k * grpSize;
			const b = a + grpSize;
			const x = gsuiWaveform.#round( ( a - startSample ) / spp );
			let min = 0;
			let max = 0;

			if ( b > 0 && a < data.length ) {
				const end = Math.min( b, data.length );

				min = Infinity;
				max = -Infinity;
				for ( let i = Math.max( 0, a ); i < end; ++i ) {
					const v = data[ i ];

					if ( v < min ) { min = v; }
					if ( v > max ) { max = v; }
				}
				min = GSUmathClamp( min, -1, 1 );
				max = GSUmathClamp( max, -1, 1 );
			}
			max = Math.round( -max * h2 );
			min = Math.round( -min * h2 );
			arrA.push( `${ x } ${ max }` );
			arrB.push( `${ x } ${ GSUmathApprox( min, max, h / 200 ) ? max - h / 200 : min }` );
		}
		return arrA.concat( arrB.reverse() );
	}
	static $getPathPerSample( h, data, startSample, spp, w ) {
		const h2 = h / 2;
		const iFirst = Math.max( 0, Math.floor( startSample ) - 1 );
		const iLast = Math.min( data.length - 1, Math.ceil( startSample + spp * w ) + 1 );
		const arrA = [];
		const arrB = [];

		for ( let i = iFirst; i <= iLast; ++i ) {
			const x = gsuiWaveform.#round( ( i - startSample ) / spp );
			const y = gsuiWaveform.#round( -GSUmathClamp( data[ i ], -1, 1 ) * h2 );

			arrA.push( `${ x } ${ y }` );
			arrB.push( `${ x } ${ y - h / 200 }` );
		}
		return arrA.concat( arrB.reverse() );
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
