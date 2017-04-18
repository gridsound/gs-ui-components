"use strict";

function gsuiWave( svg ) {
	this.rootElement = svg;
	this.poly = svg.querySelector( "polyline" );
	this.type = "sine";
	this.hz = 1;
	this.attack =
	this.amplitude = 0;
	svg.setAttribute( "preserveAspectRatio", "none" );
}

gsuiWave.sine = function( x ) {
	return Math.sin( x );
};
gsuiWave.square = function( x ) {
	return Math.sin( x ) > 0 ? 1 : -1;
};
gsuiWave.sawtooth = function( x ) {
	x /= Math.PI * 2;
	return 2 * ( x - Math.floor( x + .5 ) );
};
gsuiWave.triangle = function( x ) {
	return 2 * Math.abs( gsuiWave.sawtooth( x + Math.PI / 2 ) ) - 1;
};

gsuiWave.prototype = {
	setResolution: function( w, h ) {
		this.width = w;
		this.height = h;
		this.rootElement.setAttribute( "viewBox", "0 0 " + w + " " + h );
	},
	draw: function() {
		var x = 0,
			w = this.width,
			h2 = this.height / 2,
			amp = -this.amplitude * h2,
			attEnd = w * this.attack,
			xFac = 2 * Math.PI / w * this.hz,
			fn = gsuiWave[ this.type ],
			pts = new Float32Array( w * 2 );

		for ( ; x < w; ++x ) {
			pts[ x * 2 ] = x;
			pts[ x * 2 + 1 ] = h2 + fn( x * xFac ) * amp *
				( x < attEnd ? x / attEnd : 1 );
		}
		this.poly.setAttribute( "points", pts.join( " " ) );
	}
};
