"use strict";

gsuiWaveform.drawBuffer = function( polygon, w, h, buf, offset, duration ) {
	const d0 = buf.getChannelData( 0 );
	const d1 = buf.numberOfChannels > 1 ? buf.getChannelData( 1 ) : d0;
	const off = offset || 0;
	const dur = duration || buf.duration - off;

	gsuiWaveform.draw( polygon, w, h, d0, d1, buf.duration, off, dur );
};

gsuiWaveform.draw = function( polygon, w, h, data0, data1, bufferDuration, offset, duration ) {
	const h2 = h / 2;
	const step = duration / bufferDuration * data0.length / w;
	const ind = ~~( offset / bufferDuration * data0.length );
	const iinc = ~~Math.max( 1, step / 100 );
	let dots0 = `0,${ h2 + data0[ ind ] * h2 }`;
	let dots1 = `0,${ h2 + data1[ ind ] * h2 }`;

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
		dots0 += ` ${ p },${ h2 + lmin * h2 }`;
		dots1  =  `${ p },${ h2 + rmax * h2 } ${ dots1 }`;
	}
	GSUI.$setAttribute( polygon, "points", `${ dots0 } ${ dots1 }` );
};
