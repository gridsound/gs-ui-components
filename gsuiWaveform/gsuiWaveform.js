"use strict";

class gsuiWaveform {
	constructor( el ) {
		const svg = el || GSUI.$createElementSVG( "svg" );
		const poly = svg.querySelector( "polygon" );

		this.rootElement = svg;
		this.polygon = poly;
		this.width =
		this.height = 0;
		Object.seal( this );

		GSUI.$setAttribute( svg, "preserveAspectRatio", "none" );
		svg.classList.add( "gsuiWaveform" );
		if ( !poly ) {
			this.polygon = GSUI.$createElementSVG( "polygon" );
			svg.append( this.polygon );
		}
	}

	// .........................................................................
	remove() {
		this.empty();
		this.rootElement.remove();
	}
	empty() {
		this.polygon.removeAttribute( "points" );
	}
	setResolution( w, h ) {
		this.width = w;
		this.height = h;
		GSUI.$setAttribute( this.rootElement, "viewBox", `0 0 ${ w } ${ h }` );
	}
	drawBuffer( buf, offset, duration ) {
		gsuiWaveform.drawBuffer( this.polygon, this.width, this.height, buf, offset, duration );
	}

	// .........................................................................
	static drawBuffer( polygon, w, h, buf, offset, duration ) {
		const d0 = buf.getChannelData( 0 );
		const d1 = buf.numberOfChannels > 1 ? buf.getChannelData( 1 ) : d0;
		const off = offset || 0;
		const dur = duration || buf.duration - off;

		gsuiWaveform.draw( polygon, w, h, d0, d1, buf.duration, off, dur );
	}
	static draw( polygon, w, h, data0, data1, bufDur, offset, dur ) {
		GSUI.$setAttribute( polygon, "points", gsuiWaveform.#getPolygonPoints( w, h, data0, data1, bufDur, offset, dur ) );
	}
	static getPointsFromBuffer( w, h, buf, offset, duration ) {
		const d0 = buf.getChannelData( 0 );
		const d1 = buf.numberOfChannels > 1 ? buf.getChannelData( 1 ) : d0;
		const off = offset || 0;
		const dur = duration || buf.duration - off;

		return gsuiWaveform.#getPolygonPoints( w, h, d0, d1, buf.duration, off, dur );
	}

	// .........................................................................
	static #getPolygonPoints( w, h, data0, data1, bufDur, offset, dur ) {
		const h2 = h / 2;
		const step = dur / bufDur * data0.length / w;
		const ind = ~~( offset / bufDur * data0.length );
		const iinc = ~~Math.max( 1, step / 100 );
		let dots0 = `0,${ gsuiWaveform.#formatNb( h2 + data0[ ind ] * h2 ) }`;
		let dots1 = `0,${ gsuiWaveform.#formatNb( h2 + data1[ ind ] * h2 ) }`;

		for ( let p = 1; p < w; ++p ) {
			let lmin = Infinity;
			let rmax = -Infinity;
			let i = ~~( ind + ( p - 1 ) * step );
			const iend = i + step;

			for ( ; i < iend; i += iinc ) {
				lmin = Math.min( lmin, data0[ i ], data1[ i ] );
				rmax = Math.max( rmax, data0[ i ], data1[ i ] );
			}
			if ( Math.abs( rmax - lmin ) * h2 < 1 ) {
				rmax += 1 / h;
				lmin -= 1 / h;
			}
			dots0 += ` ${ p },${ gsuiWaveform.#formatNb( h2 + lmin * h2 ) }`;
			dots1  =  `${ p },${ gsuiWaveform.#formatNb( h2 + rmax * h2 ) } ${ dots1 }`;
		}
		return `${ dots0 } ${ dots1 }`;
	}
	static #formatNb( n ) {
		return n.toFixed( 2 );
	}
}
