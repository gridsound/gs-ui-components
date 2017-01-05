"use strict";

function gsuiOscilloscope( canvas ) {
	this.canvas = canvas;
	this.ctx = canvas.getContext( "2d" );
	this.maxValue = 0;
	this.setPinch( 0 );
	this.drawBegin( function( ctx, max, w, h ) {
		ctx.fillRect( 0, 0, w, h );
		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgb(255,255,255)";
	} );
	this.drawEnd();
};

gsuiOscilloscope.prototype = {
	setResolution: function( w, h ) {
		this.canvas.width = w;
		this.canvas.height = h;
	},
	setPinch: function( pinch ) {
		this.pinch = Math.max( 0, Math.min( pinch, 1 ) );
	},
	clear: function() {
		this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
	},
	startAnimation: function() {
		if ( !this.frameId ) {
			var that = this;

			this.frameId = requestAnimationFrame( function frame() {
				that.draw( that.fnData() );
				that.frameId = requestAnimationFrame( frame );
			} );
		}
	},
	stopAnimation: function() {
		cancelAnimationFrame( this.frameId );
		this.frameId = null;
	},
	dataFunction: function( fn ) {
		this.fnData = fn;
	},
	drawBegin: function( fn ) {
		this.fnBegin = fn || function() {};
	},
	drawEnd: function( fn ) {
		this.fnEnd = fn || function() {};
	},
	draw: function( data ) {
		var x, y,
			max = this.maxValue,
			cnv = this.canvas,
			ctx = this.ctx,
			w = cnv.width,
			h = cnv.height,
			h2 = h / 2,
			len = data.length,
			pin = Math.ceil( this.pinch / 2 * len ),
			mult = w / ( len - 1 );

		this.fnBegin( ctx, max, w, h );
		ctx.beginPath();
			max = 0;
			for ( x = 0; x < len; ++x ) {
				y = data[ x ] / 256;
				max = Math.max( max, y );
				y -= .5;
				if ( x < pin || len - pin <= x ) {
					y *= .5 - Math.cos( Math.PI * ( x < pin ? x : len - x ) / pin ) / 2;
				}
				if ( x ) {
					ctx.lineTo( x * mult, h2 + y * h );
				} else {
					ctx.moveTo( 0, h2 + y * h );
				}
			}
			this.fnEnd( ctx, max, w, h );
		ctx.stroke();
		this.maxValue = max;
	}
};
