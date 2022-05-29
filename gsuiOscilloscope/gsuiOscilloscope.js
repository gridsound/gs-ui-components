"use strict";

class gsuiOscilloscope {
	constructor( canvas ) {
		this.rootElement = canvas || GSUI.$createElement( "canvas" );
		this.rootElement.classList.add( "gsuiOscilloscope" );
		this.ctx = this.rootElement.getContext( "2d" );
		this.maxValue = 0;
		this.setPinch( 0 );
		this.drawBegin( function( ctx, max, w, h ) {
			ctx.clearRect( 0, 0, w, h );
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#fff";
		} );
		this.drawEnd();
	}

	setResolution( w, h ) {
		this.rootElement.width = w;
		this.rootElement.height = h;
	}
	clear() {
		this.ctx.clearRect( 0, 0, this.rootElement.width, this.rootElement.height );
	}
	setPinch( pinch ) {
		this.pinch = Math.max( 0, Math.min( pinch, 1 ) );
	}
	drawBegin( fn ) {
		this.fnBegin = fn || function() {};
	}
	drawEnd( fn ) {
		this.fnEnd = fn || function() {};
	}
	draw( data ) {
		const ctx = this.ctx;
		const w = this.rootElement.width;
		const h = this.rootElement.height;
		const h2 = h / 2;
		const len = data.length;
		const pin = Math.ceil( this.pinch / 2 * len );
		const mult = w / ( len - 1 );
		let max = this.maxValue;

		if ( this.fnBegin( ctx, max, w, h ) !== false ) {
			ctx.beginPath();
			max = 0;
			for ( let x = 0; x < len; ++x ) {
				let y = data[ x ] / 128 - 1;

				max = Math.max( max, Math.abs( y ) );
				if ( x < pin || len - pin <= x ) {
					y *= .5 - Math.cos( Math.PI * ( x < pin ? x : len - 1 - x ) / pin ) / 2;
				}
				if ( x === 0 ) {
					ctx.moveTo( 0, h2 + y * h2 );
				} else {
					ctx.lineTo( x * mult, h2 + y * h2 );
				}
			}
			this.fnEnd( ctx, max, w, h );
			ctx.stroke();
			this.maxValue = max;
		}
	}
}
