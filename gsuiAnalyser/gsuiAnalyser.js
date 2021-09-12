"use strict";

class gsuiAnalyser extends HTMLElement {
	#cnv = GSUI.createElement( "canvas" )
	#ctx = this.#cnv.getContext( "2d" )

	constructor() {
		super();
		Object.seal( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( this.#cnv );
		}
	}

	// .........................................................................
	clear() {
		this.#ctx.clearRect( 0, 0, this.#cnv.width, this.#cnv.height );
	}
	setResolution( w, h ) {
		const img = this.#ctx.getImageData( 0, 0, this.#cnv.width, this.#cnv.height );

		this.#cnv.width = w;
		this.#cnv.height = h;
		this.#ctx.putImageData( img, 0, 0 );
	}
	draw( ldata, rdata ) {
		gsuiAnalyser.#moveImage( this.#ctx );
		gsuiAnalyser.#draw( this.#ctx, ldata, rdata );
	}

	// .........................................................................
	static #moveImage( ctx ) {
		ctx.putImageData(
			ctx.getImageData( 0, 0, ctx.canvas.width, ctx.canvas.height - 1 ), 0, 1 );
	}
	static #draw( ctx, ldata, rdata ) {
		const w2 = ctx.canvas.width / 2,
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

Object.freeze( gsuiAnalyser );
customElements.define( "gsui-analyser", gsuiAnalyser );
