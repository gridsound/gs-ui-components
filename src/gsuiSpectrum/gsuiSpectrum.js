"use strict";

function gsuiSpectrum( canvas ) {
	this.canvas = canvas;
	this.canvas.height = 1;
	this.ctx = canvas.getContext( "2d" );
	this.colors = [
		[   5,   2,  20 ], // 0
		[   8,   5,  30 ], // 1
		[  15,   7,  50 ], // 2
		[  75,   7,  35 ],   // 3
		[  80,   0,   0 ],   // 4
		[ 180,   0,   0 ],   // 5
		[ 200,  25,  10 ], // 6
		[ 200, 128,  10 ], // 7
		[ 200, 200,  20 ], // 8
	];
};

gsuiSpectrum.prototype = {
	setResolution: function( w ) {
		this.canvas.width = w;
	},
	clear: function() {
		this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
	},
	draw: function( data ) {
		var datum, col, colId,
			r, g, b, ws,
			x = 0,
			i = 0,
			cnv = this.canvas,
			ctx = this.ctx,
			w = cnv.width,
			h = cnv.height,
			datalen = data.length;

		if ( datalen !== this.datalen ) {
			this._calcWidths( data, datalen, w );
			this.datalen = datalen;
		}
		ws = this._widths;
		for ( ; i < datalen; ++i ) {
			datum = 1 - Math.cos( data[ i ] / 255 * Math.PI / 2 );
			if ( datum < .05 ) {
				r = 4 + 10 * datum;
				g = 4 + 10 * datum;
				b = 5 + 20 * datum;
			} else {
				     if ( datum < .08 ) { colId = 0; datum /= .08; }
				else if ( datum < .15 ) { colId = 1; datum /= .15; }
				else if ( datum < .17 ) { colId = 2; datum /= .17; }
				else if ( datum < .25 ) { colId = 3; datum /= .25; }
				else if ( datum < .3  ) { colId = 4; datum /= .3; }
				else if ( datum < .4  ) { colId = 5; datum /= .4; }
				else if ( datum < .6  ) { colId = 6; datum /= .6; }
				else if ( datum < .8  ) { colId = 7; datum /= .8; }
				else                    { colId = 8; }
				col = this.colors[ colId ];
				r = col[ 0 ] * datum;
				g = col[ 1 ] * datum;
				b = col[ 2 ] * datum;
			}
			ctx.fillStyle = "rgb("
				+ ~~r + ","
				+ ~~g + ","
				+ ~~b + ")";

			ctx.fillRect( x, 0, ws[ i ], h );
			x += ws[ i ];
		}
	},

	// private:
	_calcWidths: function( data, len, w ) {
		var i, sum = 0, arr = new Array( len );

		for ( i = 0; i < len; ++i ) {
			sum += arr[ i ] = Math.log( len / ( i + 1 ) );
		}
		for ( i = 0; i < len; ++i ) {
			arr[ i ] = arr[ i ] / sum * w;
		}
		this._widths = arr;
	}
};
