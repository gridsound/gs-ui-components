"use strict";

function gsuiBeatLines( canvas ) {
	this.rootElement = canvas || document.createElement( "canvas" );
	this.rootElement.classList.add( "gsuiBeatLines" );
	this.rootElement.height = 1;
	this.ctx = this.rootElement.getContext( "2d" );
	this.offset = 0;
	this.duration =
	this.beatsPerMeasure =
	this.stepsPerBeat = 4;
}

gsuiBeatLines.prototype = {
	setResolution( w ) {
		this.rootElement.width = w;
		this.rootElement.height = 1;
	},
	draw: function() {
		var offset = this.offset,
			duration = this.duration,
			stepsBeat = this.stepsPerBeat,
			stepsMesure = stepsBeat * this.beatsPerMeasure,
			ctx = this.ctx,
			w = ctx.canvas.width,
			stepPx = w / duration / stepsBeat,
			step = offset * stepsBeat,
			x = step % 1 * -stepPx;

		step = ~~step;
		ctx.clearRect( 0, 0, w, 1 );
		for ( ; x < w; x += stepPx ) {
			if ( step % stepsMesure ) {
				ctx.fillStyle = "rgba(0,0,0," + ( step % stepsBeat ? .2 : .5 ) + ")";
			} else {
				ctx.fillStyle = "rgba(0,0,0,.15)";
				ctx.fillRect( x - 1, 0, 3, 1 );
				ctx.fillStyle = "rgba(0,0,0,1)";
			}
			ctx.fillRect( x, 0, 1, 1 );
			++step;
		}
	}
};
