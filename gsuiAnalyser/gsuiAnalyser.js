"use strict";

class gsuiAnalyser {
	setCanvas( canvas ) {
		this.rootElement = canvas;
		this._ctx = canvas.getContext( "2d" );
	}
	setResolution( w, h ) {
		this.rootElement.width = w;
		this.rootElement.height = h;
	}
	clear() {
		this._ctx.clearRect( 0, 0, this.rootElement.width, this.rootElement.height );
	}
	draw( ldata, rdata ) {
		const datalen = ldata.length,
			w = this.rootElement.width / 2;

		if ( this._datalen !== datalen || this._width !== w ) {
			this._width = w;
			this._datalen = datalen;
			this._widths = gsuiSpectrum.calcFreqSizes( datalen, w );
		}
		this._moveImage();
		this._draw( ldata, rdata );
	}

	// private:
	_draw( ldata, rdata ) {
		const ctx = this._ctx;

		ctx.save();
			ctx.translate( this._width, 0 );
			gsuiSpectrum.draw( ctx, rdata, this._widths );
			ctx.scale( -1, 1 );
			gsuiSpectrum.draw( ctx, ldata, this._widths );
		ctx.restore();
	}
	_moveImage() {
		const cnv = this.rootElement,
			img = this._ctx.getImageData( 0, 0, cnv.width, cnv.height - 1 );

		this._ctx.putImageData( img, 0, 1 );
	}
}
