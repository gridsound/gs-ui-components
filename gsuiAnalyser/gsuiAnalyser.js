"use strict";

class gsuiAnalyser {
	#ctx = null

	constructor() {
		this.rootElement = null;
		Object.seal( this );
	}
	setCanvas( canvas ) {
		this.rootElement = canvas;
		this.#ctx = canvas.getContext( "2d" );
	}
	clear() {
		this.#ctx.clearRect( 0, 0, this.rootElement.width, this.rootElement.height );
	}
	setResolution( w, h ) {
		const cnv = this.rootElement,
			img = this.#ctx.getImageData( 0, 0, cnv.width, cnv.height );

		cnv.width = w;
		cnv.height = h;
		this.#ctx.putImageData( img, 0, 0 );
	}
	draw( ldata, rdata ) {
		this.#moveImage();
		this.#draw( ldata, rdata );
	}

	// .........................................................................
	#moveImage() {
		const cnv = this.rootElement,
			img = this.#ctx.getImageData( 0, 0, cnv.width, cnv.height - 1 );

		this.#ctx.putImageData( img, 0, 1 );
	}
	#draw( ldata, rdata ) {
		const ctx = this.#ctx,
			w2 = ctx.canvas.width / 2,
			len = Math.min( w2, ldata.length ),
			imgL = gsuiSpectrum.draw( ctx, ldata, w2 ),
			imgR = gsuiSpectrum.draw( ctx, rdata, w2 ),
			imgLflip = ctx.createImageData( len, 1 );

		for ( let x = 0, x2 = len - 1; x < len; ++x, --x2 ) {
			imgLflip.data[ x * 4     ] = imgL.data[ x2 * 4     ];
			imgLflip.data[ x * 4 + 1 ] = imgL.data[ x2 * 4 + 1 ];
			imgLflip.data[ x * 4 + 2 ] = imgL.data[ x2 * 4 + 2 ];
			imgLflip.data[ x * 4 + 3 ] = imgL.data[ x2 * 4 + 3 ];
		}
		ctx.putImageData( imgLflip, 0, 0 );
		ctx.putImageData( imgR, w2, 0 );
	}
}
