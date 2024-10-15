"use strict";

class gsuiAnalyserHist extends gsui0ne {
	#ctx = null;
	#type = "hz";

	constructor() {
		super( {
			$cmpName: "gsuiAnalyserHist",
			$tagName: "gsui-analyser-hist",
			$template: GSUcreateElement( "canvas" ),
		} );
		this.#ctx = this.$element.getContext( "2d", { willReadFrequently: true } );
		Object.seal( this );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "type" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "type":
				this.#type = val;
				break;
		}
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
		gsuiAnalyserHist.#moveImage( this.#ctx );
		switch ( this.#type ) {
			case "hz": gsuiAnalyserHist.#drawHz( this.#ctx, ldata, rdata ); break;
			case "td": gsuiAnalyserHist.#drawTd( this.#ctx, ldata, rdata ); break;
		}
	}

	// .........................................................................
	static #moveImage( ctx ) {
		ctx.putImageData( ctx.getImageData( 0, 0, ctx.canvas.width, ctx.canvas.height - 1 ), 0, 1 );
	}

	// .........................................................................
	static #drawHz( ctx, ldata, rdata ) {
		const w2 = ctx.canvas.width / 2;
		const len = Math.min( w2, ldata.length );
		const imgL = gsuiAnalyserHz.$draw( ctx, ldata, w2 );
		const imgR = gsuiAnalyserHz.$draw( ctx, rdata, w2 );
		const imgLflip = ctx.createImageData( len, 1 );

		for ( let x = 0, x2 = len - 1; x < len; ++x, --x2 ) {
			gsuiAnalyserHist.#drawHzPx( imgLflip.data, imgL.data, x * 4, x2 * 4 );
		}
		ctx.putImageData( imgLflip, 0, 0 );
		ctx.putImageData( imgR, w2, 0 );
	}
	static #drawHzPx( imgLflip, imgL, x, x2 ) {
		imgLflip[ x     ] = imgL[ x2     ];
		imgLflip[ x + 1 ] = imgL[ x2 + 1 ];
		imgLflip[ x + 2 ] = imgL[ x2 + 2 ];
		imgLflip[ x + 3 ] = imgL[ x2 + 3 ];
	}

	// .........................................................................
	static #drawTd( ctx, ldata, rdata ) {
		const l = gsuiAnalyserHist.#drawTdMax( ldata );
		const r = gsuiAnalyserHist.#drawTdMax( rdata );
		const w = ctx.canvas.width;
		const a = w / 2 - l * w / 2;
		const b = l * w / 2 + r * w / 2;

		ctx.beginPath(); ctx.fillStyle = "#000"; ctx.rect( 0, 0, w, 1 ); ctx.fill();
		ctx.beginPath(); ctx.fillStyle = "#ff9"; ctx.rect( a, 0, b, 1 ); ctx.fill();
	}
	static #drawTdMax( arr ) {
		return Array.prototype.reduce.call( arr, ( res, n ) => Math.max( res, Math.abs( n ) ), 0 );
	}
}

GSUdefineElement( "gsui-analyser-hist", gsuiAnalyserHist );
