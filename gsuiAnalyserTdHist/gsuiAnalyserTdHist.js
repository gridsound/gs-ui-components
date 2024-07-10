"use strict";

class gsuiAnalyserTdHist extends gsui0ne {
	#ctx = null;

	constructor() {
		super( {
			$cmpName: "gsuiAnalyserTdHist",
			$tagName: "gsui-analyser-td-hist",
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
		const ctx = this.#ctx;
		const cnv = ctx.canvas;
		const img = ctx.getImageData( 0, 0, cnv.width, cnv.height - 1 );
		const w2 = cnv.width / 2;
		const l = gsuiAnalyserTdHist.#getMax( ldata );
		const r = gsuiAnalyserTdHist.#getMax( rdata );

		this.$clear();
		ctx.putImageData( img, 0, 1 );
		ctx.beginPath();
		ctx.fillStyle = "#ff9";
		ctx.rect( w2 - l * w2, 0, l * w2 + r * w2, 1 );
		ctx.fill();
	}

	// .........................................................................
	static #getMax( arr ) {
		return Array.prototype.reduce.call( arr, ( res, n ) => Math.max( res, Math.abs( n ) ), 0 );
	}
}

GSUdefineElement( "gsui-analyser-td-hist", gsuiAnalyserTdHist );
