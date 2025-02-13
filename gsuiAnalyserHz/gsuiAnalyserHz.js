"use strict";

class gsuiAnalyserHz extends gsui0ne {
	static #colors = [
		// datum    R    G    B
		[ .99,    255, 255, 255 ],
		[ .98,    255, 255, 100 ],
		[ .97,    200, 200, 100 ],
		[ .95,    200, 200,  80 ],
		[ .9,      60,  90,  80 ],
		[ .8,      45,  45,  80 ],
		[ .7,      40,  40,  80 ],
		[ .6,      35,  35,  80 ],
		[ .4,      30,  30,  70 ],
		[ .3,      20,  20,  50 ],
		[ .25,     10,  10,  35 ],
		[ .17,      5,   5,  25 ],
		[ .1,       0,   0,  10 ],
		[ .01,      0,   0,   5 ],
		[  0,       0,   0,   0 ],
	];
	#bgcolor = [ 0, 0, 0 ];
	#ctx = null;

	constructor() {
		super( {
			$cmpName: "gsuiAnalyserHz",
			$tagName: "gsui-analyser-hz",
			$template: GSUcreateElement( "canvas" ),
			$attributes: {
				resolution: 256,
				bgcolor: "0 0 0",
			},
		} );
		Object.seal( this );
		this.#ctx = this.$element.getContext( "2d" );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "bgcolor", "resolution" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "resolution":
				this.$element.width = +val;
				this.$element.height = 1;
				break;
			case "bgcolor": {
				const rgb = GSUsplitNums( val );

				this.#bgcolor[ 0 ] = rgb[ 0 ];
				this.#bgcolor[ 1 ] = rgb[ 1 ];
				this.#bgcolor[ 2 ] = rgb[ 2 ];
			} break;
		}
	}

	// .........................................................................
	$clear() {
		this.#ctx.clearRect( 0, 0, this.$element.width, 1 );
	}
	$draw( data ) {
		this.#ctx.putImageData( gsuiAnalyserHz.$draw( this.#ctx, data, this.$element.width, this.#bgcolor ), 0, 0 );
	}

	// .........................................................................
	static $draw( ctx, data, width = data.length, bgcolor = [ 0, 0, 0 ] ) {
		const img = ctx.createImageData( width, 1 );
		const imgData = img.data;
		const [ bgR, bgG, bgB ] = bgcolor;

		for ( let i = 0; i < width; ++i ) {
			const x = i * 4;
			const i2 = Math.round( GSUXtoHz( i / width ) * data.length );
			const datum = GSUeaseOutCirc( 1 - ( data[ i2 ] / -200 ) ) || 0;
			const rdatum = 1 - datum;
			const [ , r, g, b ] = gsuiAnalyserHz.#colors.find( arr => arr[ 0 ] <= datum ) || gsuiAnalyserHz.#colors.at( -1 );

			imgData[ x     ] = Math.min( bgR * rdatum + r * datum, 255 ) | 0;
			imgData[ x + 1 ] = Math.min( bgG * rdatum + g * datum, 255 ) | 0;
			imgData[ x + 2 ] = Math.min( bgB * rdatum + b * datum, 255 ) | 0;
			imgData[ x + 3 ] = 255;
		}
		return img;
	}
}

GSUdefineElement( "gsui-analyser-hz", gsuiAnalyserHz );
