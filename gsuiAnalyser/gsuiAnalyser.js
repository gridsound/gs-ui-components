"use strict";

class gsuiAnalyser extends gsui0ne {
	#ctx = null;

	constructor() {
		super( {
			$cmpName: "gsuiAnalyser",
			$tagName: "gsui-analyser",
			$template: GSUcreateElement( "canvas" ),
		} );
		this.#ctx = this.$element.getContext( "2d" );
		Object.seal( this );
	}

	// .........................................................................
	$clear() {
		this.#ctx.clearRect( 0, 0, this.$element.width, this.$element.height );
	}
	$setResolution( w, h ) {
		const img = this.#ctx.getImageData( 0, 0, this.$element.width, this.$element.height );

		this.$element.width = w;
		this.$element.height = h;
		this.#ctx.putImageData( img, 0, 0 );
	}
	$draw( ldata, rdata ) {
		gsuiAnalyser.#moveImage( this.#ctx );
		gsuiAnalyser.#draw( this.#ctx, ldata, rdata );
	}

	// .........................................................................
	static #moveImage( ctx ) {
		ctx.putImageData( ctx.getImageData( 0, 0, ctx.canvas.width, ctx.canvas.height - 1 ), 0, 1 );
	}
	static #draw( ctx, ldata, rdata ) {
		const w2 = ctx.canvas.width / 2;
		const len = Math.min( w2, ldata.length );
		const imgL = gsuiSpectrum.$draw( ctx, ldata, w2 );
		const imgR = gsuiSpectrum.$draw( ctx, rdata, w2 );
		const imgLflip = ctx.createImageData( len, 1 );

		for ( let x = 0, x2 = len - 1; x < len; ++x, --x2 ) {
			gsuiAnalyser.#drawPx( imgLflip.data, imgL.data, x * 4, x2 * 4 );
		}
		ctx.putImageData( imgLflip, 0, 0 );
		ctx.putImageData( imgR, w2, 0 );
	}
	static #drawPx( imgLflip, imgL, x, x2 ) {
		imgLflip[ x     ] = imgL[ x2     ];
		imgLflip[ x + 1 ] = imgL[ x2 + 1 ];
		imgLflip[ x + 2 ] = imgL[ x2 + 2 ];
		imgLflip[ x + 3 ] = imgL[ x2 + 3 ];
	}
}

Object.freeze( gsuiAnalyser );
customElements.define( "gsui-analyser", gsuiAnalyser );
