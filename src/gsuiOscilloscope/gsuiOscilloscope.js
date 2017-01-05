"use strict";

function gsuiOscilloscope( canvas ) {
	this.canvas = canvas;
	this.ctx = canvas.getContext( "2d" );
	this.maxValue = 0;
	this.setPinch( 0 );
	this.drawBegin( function( ctx, max, w, h ) {
		ctx.globalCompositeOperation = "source-in";
		ctx.fillStyle = "rgba(" +
			Math.round( 255 - max * 128 ) + "," +
			Math.round( max * 32 ) + "," +
			Math.round( max * 128 ) + "," +
			( .95 - .25 * ( 1 - Math.cos( max * Math.PI / 4 ) ) ) +
		")";
		ctx.fillRect( 0, 0, w, h );
		ctx.globalCompositeOperation = "source-over";
	} );
	this.drawEnd( function( ctx, max ) {
		ctx.lineJoin = "round";
		ctx.lineWidth = 1 + Math.round( 2 * max );
		ctx.strokeStyle = "rgba(255,255,255," + Math.min( .5 + max * .5, 1 ) + ")";
	} );
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
		var that = this;

		this.frameId = requestAnimationFrame( function frame() {
			that.draw( that.fnData() );
			that.frameId = requestAnimationFrame( frame );
		} );
	},
	stopAnimation: function() {
		cancelAnimationFrame( this.frameId );
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
