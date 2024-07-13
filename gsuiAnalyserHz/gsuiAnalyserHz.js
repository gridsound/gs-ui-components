"use strict";

class gsuiAnalyserHz extends gsui0ne {
	static #colors = [
		// datum    R    G    B
		[ .99,    255, 255, 255 ],
		[ .98,    255, 255, 100 ],
		[ .97,    200, 200, 100 ],
		[ .95,    200, 200,  40 ],
		[ .9,      60,  80,  40 ],
		[ .8,      50,  50,  40 ],
		[ .7,      50,  50,  60 ],
		[ .6,      40,  40,  60 ],
		[ .4,      30,  30,  80 ],
		[ .3,      20,  20,  50 ],
		[ .25,     10,  10,  35 ],
		[ .17,      5,   5,  25 ],
		[ .1,       0,   0,  10 ],
		[ .01,      0,   0,   5 ],
		[  0,       0,   0,   0 ],
	];
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
	static $draw( ctx, data, width = data.length ) {
		const img = ctx.createImageData( width, 1 );
		const imgData = img.data;
		let diSave = -1;

		for ( let i = 0; i < width; ++i ) {
			const x = i * 4;
			const i2 = Math.floor( GSUeaseInCirc( i / width, 2 ) * data.length );
			const datum = GSUeaseOutCirc( 1 - ( data[ i2 ] / -200 ) ) || 0;
			const [ , r, g, b ] = gsuiAnalyserHz.#colors.find( arr => arr[ 0 ] <= datum ) || gsuiAnalyserHz.#colors.at( -1 );

			diSave = i2;
			imgData[ x     ] = r * datum | 0;
			imgData[ x + 1 ] = g * datum | 0;
			imgData[ x + 2 ] = b * datum | 0;
			imgData[ x + 3 ] = 255;
		}
		return img;
	}
}

GSUdefineElement( "gsui-analyser-hz", gsuiAnalyserHz );
