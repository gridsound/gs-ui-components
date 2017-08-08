"use strict";

window.SVGURL = "http://www.w3.org/2000/svg";

function gsuiWaveform( svg ) {
	this.rootElement = svg || document.createElementNS( SVGURL, "svg" );
	this.rootElement.setAttribute( "preserveAspectRatio", "none" );
	this.rootElement.classList.add( "gsuiWaveform" );
	this.polygon = this.rootElement.querySelector( "polygon" );
	if ( !this.polygon ) {
		this.polygon = document.createElementNS( SVGURL, "polygon" );
		this.rootElement.appendChild( this.polygon );
	}
};

gsuiWaveform.prototype = {
	remove() {
		this.empty();
		this.rootElement.remove();
	},
	empty() {
		this.polygon.removeAttribute( "points" );
	},
	setResolution( w, h ) {
		this.width = w;
		this.height = h;
		this.rootElement.setAttribute( "viewBox", "0 0 " + w + " " + h );
	},
	render( buf, offset, duration ) {
		var d0 = buf.getChannelData( 0 ),
			d1 = buf.numberOfChannels > 1 ? buf.getChannelData( 1 ) : d0;

		offset = offset || 0;
		this.draw( d0, d1, buf.duration, offset, duration || buf.duration - offset );
	},
	draw( data0, data1, bufferDuration, offset, duration ) {
		var p,
			w = this.width,
			h = this.height,
			h2 = h / 2,
			dataLen = data0.length,
			ind = ~~( offset / bufferDuration * dataLen ),
			step = duration / bufferDuration * dataLen / w,
			dots0 = "0," + ( h2 + data0[ ind ] * h2 ),
			dots1 = "0," + ( h2 + data1[ ind ] * h2 ),
			iinc = ~~Math.max( 1, step / 100 );

		for ( p = 1; p < w; ++p ) {
			var lmin = Infinity,
				rmax = -Infinity,
				i = ~~( ind + ( p - 1 ) * step ),
				iend = i + step;

			for ( ; i < iend; i += iinc ) {
				lmin = Math.min( lmin, data0[ i ], data1[ i ] );
				rmax = Math.max( rmax, data0[ i ], data1[ i ] );
			}
			if ( Math.abs( rmax - lmin ) * h2 < 1 ) {
				rmax += 1 / h;
				lmin -= 1 / h;
			}
			dots0 += " " + p + "," + ( h2 + lmin * h2 );
			dots1  =       p + "," + ( h2 + rmax * h2 ) + " " + dots1;
		}
		this.polygon.setAttribute( "points", dots0 + " " + dots1 );
	}
};
