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
	#ctx = null;

	constructor() {
		super( {
			$cmpName: "gsuiAnalyserHz",
			$tagName: "gsui-analyser-hz",
			$jqueryfy: true,
			$template: GSUcreateElement( "canvas", { inert: true } ),
			$attributes: {
				resolution: 256,
			},
		} );
		Object.seal( this );
		this.#ctx = this.$element.$get( 0 ).getContext( "2d" );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "resolution" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "resolution":
				this.#ctx.canvas.width = +val;
				this.#ctx.canvas.height = 1;
				break;
		}
	}

	// .........................................................................
	$clear() {
		this.#ctx.clearRect( 0, 0, this.#ctx.canvas.width, 1 );
	}
	$draw( data ) {
		this.#ctx.putImageData( gsuiAnalyserHz.$draw( this.#ctx, data, this.#ctx.canvas.width ), 0, 0 );
	}

	// .........................................................................
	static $draw( ctx, data, width = data.length ) {
		const img = ctx.createImageData( width, 1 );
		const imgData = img.data;

		for ( let i = 0; i < width; ++i ) {
			const x = i * 4;
			const i2 = Math.round( GSUXtoHz( i / width ) * data.length );
			const datum = GSUmathEaseOutCirc( 1 - ( data[ i2 ] / -200 ) ) || 0;
			const [ , r, g, b ] = gsuiAnalyserHz.#colors.find( arr => arr[ 0 ] <= datum ) || gsuiAnalyserHz.#colors.at( -1 );

			imgData[ x     ] = Math.min( r * datum, 255 ) | 0;
			imgData[ x + 1 ] = Math.min( g * datum, 255 ) | 0;
			imgData[ x + 2 ] = Math.min( b * datum, 255 ) | 0;
			imgData[ x + 3 ] = datum * 255;
		}
		return img;
	}
}

GSUdomDefine( "gsui-analyser-hz", gsuiAnalyserHz );
