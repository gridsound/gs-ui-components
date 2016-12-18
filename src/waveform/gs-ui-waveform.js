"use strict";

function gsuiWaveform( element, data ) {
	this.svg = element;
	this.polygon = element.querySelector( "polygon" );
};

gsuiWaveform.prototype = {
	setResolution: function( w, h ) {
		this.width = w;
		this.height = h;
		this.svg.setAttribute( "viewBox", "0 0 " + w + " " + h );
	},
	setBuffer: function( buf ) {
		this.buf = buf;
	},
	draw: function( offset, duration ) {
		var p,
			w = this.width,
			h = this.height,
			h2 = h / 2,
			bufDur = this.buf.duration,
			ofs = offset || 0,
			dur = Math.min( duration || bufDur, bufDur - ofs ),
			ldata = this.buf.getChannelData( 0 ),
			rdata = this.buf.getChannelData( 1 ),
			dataLen = ldata.length,
			ind = ~~( ofs / bufDur * dataLen ),
			step = dur / bufDur * dataLen / w,
			ldots = "0," + ( h2 + ldata[ ind ] * h2 ),
			rdots = "0," + ( h2 + rdata[ ind ] * h2 ),
			iinc = ~~Math.max( 1, step / 100 );

		for ( p = 1; p < w; ++p ) {
			var lmin = Infinity,
				rmax = -Infinity,
				i = ~~( ind + ( p - 1 ) * step ),
				iend = i + step;

			for ( ; i < iend; i += iinc ) {
				lmin = Math.min( lmin, ldata[ i ], rdata[ i ] );
				rmax = Math.max( rmax, rdata[ i ], ldata[ i ] );
			}
			if ( Math.abs( rmax - lmin ) * h2 < 1 ) {
				rmax += 1 / h;
				lmin -= 1 / h;
			}
			ldots += " " + p + "," + ( h2 + lmin * h2 );
			rdots  =       p + "," + ( h2 + rmax * h2 ) + " " + rdots;
		}
		this.polygon.setAttribute( "points", ldots + " " + rdots );
	}
};
