"use strict";

gsuiSpectrum.calcFreqSizes = function( datalen, size ) {
	const arr = ( new Array( datalen ) ).fill( 0 ),
		sum = arr.reduce( ( sum, _, i, arr ) => (
			sum +=
			arr[ i ] = Math.log( datalen / ( i + 1 ) )
		), 0 );

	arr.forEach( ( val, i, arr ) => {
		arr[ i ] = val / sum * size;
	} );
	return arr;
};
