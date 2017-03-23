"use strict";

( function() {

window.gsuiSpectrum = function( canvas ) {
	this.canvas = canvas;
	this.ctx = canvas.getContext( "2d" );
	this.colors = [
		[  12,   6,  50 ], // 0
		[ 125, 100, 200 ], // 1
		[ 380,  60,  50 ], // 2
		[ 510,  25,  20 ], // 3
		[ 160,  80,  10 ], // 4
		[ 150, 150,  20 ], // 5
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
			r, g, b,
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
		for ( x = 0; x < datalen; ++x ) {
			datum  = 1 - Math.cos( data[ x ] / 255 * Math.PI / 2 );
			if ( datum < .01 ) {
				r = 4 + 10 * datum;
				g = 4 + 10 * datum;
				b = 5 + 20 * datum;
			} else {
				color = this.colors[
					datum < .08 ? 0 :
					datum < .2  ? 1 :
					datum < .4  ? 2 :
					datum < .5  ? 3 :
					datum < .75 ? 4 : 5
				];
				r = color[ 0 ] * datum;
				g = color[ 1 ] * datum;
				b = color[ 2 ] * datum;
			}
			ctx.fillStyle = "rgb("
				+ ~~r + ","
				+ ~~g + ","
				+ ~~b + ")";
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
