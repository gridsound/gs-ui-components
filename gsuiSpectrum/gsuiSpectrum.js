"use strict";

class gsuiSpectrum {
	constructor( canvas ) {
		this.rootElement = canvas || document.createElement( "canvas" );
		this.rootElement.classList.add( "gsuiSpectrum" );
		this.ctx = this.rootElement.getContext( "2d" );
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
	}

	setResolution( w ) {
		this.rootElement.width = w;
		this.rootElement.height = 1;
	}
	clear() {
		this.ctx.clearRect( 0, 0, this.rootElement.width, 1 );
	}
	draw( data ) {
		const datalen = data.length,
			w = this.rootElement.width;
		let ws;

		if ( this._datalen !== datalen || this._width !== w ) {
			this._width = w;
			this._datalen = datalen;
			this._calcWidths( datalen, w );
		}
		ws = this._widths;
		for ( let i = 0, x = 0; i < datalen; ++i ) {
			let r, g, b,
				datum = 1 - Math.cos( data[ i ] / 255 * Math.PI / 2 );

			if ( datum < .05 ) {
				r = 4 + 10 * datum;
				g = 4 + 10 * datum;
				b = 5 + 20 * datum;
			} else {
				let col, colId;

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
			this.ctx.fillStyle = "rgb("
				+ ~~r + ","
				+ ~~g + ","
				+ ~~b + ")";
			this.ctx.fillRect( x, 0, ws[ i ], 1 );
			x += ws[ i ];
		}
	}

	// private:
	_calcWidths( len, w ) {
		const arr = new Array( len );
		let sum = 0;

		for ( let i = 0; i < len; ++i ) {
			sum +=
			arr[ i ] = Math.log( len / ( i + 1 ) );
		}
		for ( let i = 0; i < len; ++i ) {
			arr[ i ] = arr[ i ] / sum * w;
		}
		this._widths = arr;
	}
}
