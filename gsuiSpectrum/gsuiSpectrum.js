"use strict";

class gsuiSpectrum {
	constructor() {
		this.rootElement =
		this._ctx = null;
		this._scaleToData = true;
		Object.seal( this );
	}
	setCanvas( cnv ) {
		this.rootElement = cnv;
		this._ctx = cnv.getContext( "2d" );
		cnv.height = 1;
		cnv.classList.add( "gsuiSpectrum" );
	}
	clear() {
		this._ctx.clearRect( 0, 0, this.rootElement.width, 1 );
	}
	setResolution( w ) {
		this.rootElement.width = w;
		this.rootElement.height = 1;
	}
	scaleToData( b ) {
		this._scaleToData = b;
	}
	draw( data ) {
		const w = data.length,
			img = gsuiSpectrum.draw( this._ctx, data );

		if ( this._scaleToData && w !== this.rootElement.width ) {
			this.rootElement.width = w;
		}
		this._ctx.putImageData( img, 0, 0 );
	}
}
