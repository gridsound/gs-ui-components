"use strict";

class gsuiAnalyserHz extends gsui0ne {
	#ctx = null;

	constructor() {
		super( {
			$cmpName: "gsuiAnalyserHz",
			$tagName: "gsui-analyser-hz",
			$template: GSUcreateElement( "canvas" ),
		} );
		Object.seal( this );
		this.#ctx = this.$element.getContext( "2d" );
		this.$element.height = 1;
	}

	// .........................................................................
	$clear() {
		this.#ctx.clearRect( 0, 0, this.$element.width, 1 );
	}
	$setResolution( w ) {
		this.$element.width = w;
		this.$element.height = 1;
	}
	$draw( data ) {
		this.#ctx.putImageData( gsuiAnalyserHz.$draw( this.#ctx, data, this.$element.width ), 0, 0 );
	}

	// .........................................................................
	static #datumDivision = [ .08, .15, .17, .25, .3, .4, .6, .8, Infinity ];
	static #colors = [
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
	static $draw( ctx, data, width = data.length ) {
		const img = ctx.createImageData( width, 1 );
		const imgData = img.data;
		const datalen = data.length;
		let diSave = -1;

		for ( let i = 0; i < width; ++i ) {
			const x = i * 4;
			const di = Math.max( Math.round( datalen * ( 2 ** ( ( i / width ) * 11 - 11 ) ) ), diSave + 1 );
			const datum = 1 - Math.cos( data[ di ] / 255 * Math.PI / 2 );

			diSave = di;
			if ( datum < .05 ) {
				imgData[ x     ] = 4 + 10 * datum | 0;
				imgData[ x + 1 ] = 4 + 10 * datum | 0;
				imgData[ x + 2 ] = 5 + 20 * datum | 0;
			} else {
				const colId = gsuiAnalyserHz.#datumDivision.findIndex( x => datum < x );
				const col = gsuiAnalyserHz.#colors[ colId ];
				const datumCut = datum / col[ 3 ];

				imgData[ x     ] = col[ 0 ] * datumCut | 0;
				imgData[ x + 1 ] = col[ 1 ] * datumCut | 0;
				imgData[ x + 2 ] = col[ 2 ] * datumCut | 0;
			}
			imgData[ x + 3 ] = 255;
		}
		return img;
	}
}

GSUdefineElement( "gsui-analyser-hz", gsuiAnalyserHz );
