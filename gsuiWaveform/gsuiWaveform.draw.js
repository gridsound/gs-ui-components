"use strict";

gsuiWaveform.drawBuffer = function( polygon, w, h, buf, offset, duration ) {
	const d0 = buf.getChannelData( 0 ),
		d1 = buf.numberOfChannels > 1 ? buf.getChannelData( 1 ) : d0,
		off = offset || 0,
		dur = duration || buf.duration - off;

	gsuiWaveform.draw( polygon, w, h, d0, d1, buf.duration, off, dur );
};

gsuiWaveform.draw = function( polygon, w, h, data0, data1, bufferDuration, offset, duration ) {
	const h2 = h / 2,
		step = duration / bufferDuration * data0.length / w,
		ind = ~~( offset / bufferDuration * data0.length ),
		iinc = ~~Math.max( 1, step / 100 );
	let dots0 = `0,${ h2 + data0[ ind ] * h2 }`,
		dots1 = `0,${ h2 + data1[ ind ] * h2 }`;

	for ( let p = 1; p < w; ++p ) {
		let lmin = Infinity,
			rmax = -Infinity,
			i = ~~( ind + ( p - 1 ) * step );
		const iend = i + step;

		for ( ; i < iend; i += iinc ) {
			lmin = Math.min( lmin, data0[ i ], data1[ i ] );
			rmax = Math.max( rmax, data0[ i ], data1[ i ] );
		}
		if ( Math.abs( rmax - lmin ) * h2 < 1 ) {
			rmax += 1 / h;
			lmin -= 1 / h;
		}
		dots0 += ` ${ p },${ h2 + lmin * h2 }`;
		dots1  =  `${ p },${ h2 + rmax * h2 } ${ dots1 }`;
	}
	polygon.setAttribute( "points", `${ dots0 } ${ dots1 }` );
};
