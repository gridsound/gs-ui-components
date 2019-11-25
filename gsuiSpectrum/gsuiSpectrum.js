"use strict";

class gsuiSpectrum {
	constructor() {
		this.rootElement =
		this._ctx = null;
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
	draw( data ) {
		this._ctx.putImageData( gsuiSpectrum.draw( this._ctx, data, this.rootElement.width ), 0, 0 );
	}
}
