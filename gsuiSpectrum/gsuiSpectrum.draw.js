"use strict";

gsuiSpectrum.draw = function( ctx, data ) {
	const datalen = data.length,
		img = ctx.createImageData( datalen, 1 ),
		imgData = img.data;

	for ( let i = 0; i < datalen; ++i ) {
		const x = i * 4,
			datum = 1 - Math.cos( data[ i ] / 255 * Math.PI / 2 );

		if ( datum < .05 ) {
			imgData[ x     ] = 4 + 10 * datum | 0;
			imgData[ x + 1 ] = 4 + 10 * datum | 0;
			imgData[ x + 2 ] = 5 + 20 * datum | 0;
		} else {
			const col = gsuiSpectrum.colors[ gsuiSpectrum._getColorId( datum ) ],
				datumCut = datum / col[ 3 ];

			imgData[ x     ] = col[ 0 ] * datumCut | 0;
			imgData[ x + 1 ] = col[ 1 ] * datumCut | 0;
			imgData[ x + 2 ] = col[ 2 ] * datumCut | 0;
		}
		imgData[ x + 3 ] = 255;
	}
	return img;
};

gsuiSpectrum._getColorId = function( datum ) {
	     if ( datum < .08 ) { return 0; }
	else if ( datum < .15 ) { return 1; }
	else if ( datum < .17 ) { return 2; }
	else if ( datum < .25 ) { return 3; }
	else if ( datum < .3  ) { return 4; }
	else if ( datum < .4  ) { return 5; }
	else if ( datum < .6  ) { return 6; }
	else if ( datum < .8  ) { return 7; }
	return 8;
};

gsuiSpectrum.colors = [
	[   5,   2,  20, .08 ], // 0
	[   8,   5,  30, .15 ], // 1
	[  15,   7,  50, .17 ], // 2
	[  75,   7,  35, .25 ],   // 3
	[  80,   0,   0, .3  ],   // 4
	[ 180,   0,   0, .4  ],   // 5
	[ 200,  25,  10, .6  ], // 6
	[ 200, 128,  10, .8  ], // 7
	[ 200, 200,  20, 1   ], // 8
];
