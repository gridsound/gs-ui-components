"use strict";

class gsuiSpectrum {
	constructor() {}

	setCanvas( cnv ) {
		this.rootElement = cnv;
		this._ctx = cnv.getContext( "2d" );
		cnv.classList.add( "gsuiSpectrum" );
	}
	setResolution( w ) {
		this.rootElement.width = w;
		this.rootElement.height = 1;
	}
	clear() {
		this._ctx.clearRect( 0, 0, this.rootElement.width, 1 );
	}
	draw( data ) {
		const datalen = data.length,
			w = this.rootElement.width;

		if ( this._datalen !== datalen || this._width !== w ) {
			this._width = w;
			this._datalen = datalen;
			this._widths = gsuiSpectrum.calcFreqSizes( datalen, w );
		}
		gsuiSpectrum.draw( this._ctx, data, this._widths );
	}
}
