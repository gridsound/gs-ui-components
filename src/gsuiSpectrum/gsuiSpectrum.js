"use strict";

( function() {

window.gsuiSpectrum = function( canvas ) {
	this.canvas = canvas;
	this.ctx = canvas.getContext( "2d" );
	this.colors = [
		[  12,   6,  50 ],
		[ 125, 100, 200 ],
		[ 400,  60,  50 ],
		[ 510,  25,  20 ],
		[ 120, 120,   0 ],
	];
};

gsuiSpectrum.prototype = {
	setResolution: function( w, h ) {
		this.canvas.width = w;
		this.canvas.height = h;
	},
	clear: function() {
		this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
	},
	draw: function( data ) {
		var datum,
			datalen,
			datumlen,
			color,
			x = 0,
			cnv = this.canvas,
			ctx = this.ctx,
			w = cnv.width,
			h = cnv.height;

		if ( w < data.length ) {
			data = shrinkArray( data, w );
		}
		datalen = data.length;
		datumlen = w / datalen;
		ctx.clearRect( 0, 0, w, h );
		for ( x = 0; x < datalen; ++x ) {
			datum = data[ x ] / 255;
			datum  = 1 - Math.cos( datum * Math.PI / 2 );
			// datum = 1 - Math.sqrt( 1 - datum * datum );
			color = this.colors[
				datum < .08 ? 0 :
				datum < .2  ? 1 :
				datum < .4  ? 2 :
				datum < .5  ? 3 :
					4
			];
			ctx.fillStyle = "rgb("
				+ ~~( color[ 0 ] * datum ) + ","
				+ ~~( color[ 1 ] * datum ) + ","
				+ ~~( color[ 2 ] * datum ) + ")";
			ctx.fillRect( x * datumlen, 0, datumlen, h );
		}
	}
};

function shrinkArray( arr, newlen ) {
	var avg,
		avglenj,
		i = 0,
		j = 0,
		len = arr.length,
		avglen = ~~( len / newlen ),
		newarr = [];

	for ( ; i < newlen; ++i ) {
		avg = 0;
		avglenj = j + avglen;
		while ( j < avglenj && j < len ) {
			avg += arr[ j++ ];
		}
		newarr.push( avg / avglen );
	}
	return newarr;
}

} )();
