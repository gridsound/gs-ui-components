"use strict";

window.SVGURL = "http://www.w3.org/2000/svg";

function gsuiPeriodicWave( svg ) {
	var root = svg || document.createElementNS( SVGURL, "svg" );

	this.rootElement = root;
	root.setAttribute( "preserveAspectRatio", "none" );
	root.classList.add( "gsuiPeriodicWave" );
	this.polyline = root.querySelector( "polyline" );
	if ( !this.polyline ) {
		this.polyline = document.createElementNS( SVGURL, "polyline" );
		root.appendChild( this.polyline );
	}
	this.amplitude = 1;
	this.frequency = 1;
	this.attack = 0;
}

gsuiPeriodicWave.cache = {};
gsuiPeriodicWave.addWave = function( name, real, imag ) {
	var arr, fn, x = 0,
		cache = gsuiPeriodicWave.cache;

	if ( !cache[ name ] ) {
		cache[ name ] = arr = [];
		fn = gsuiPeriodicWave.getXFromWave.bind( null, real, imag );
		for ( ; x < 256; ++x ) {
			arr.push( fn( x / 256 ) );
		}
	}
};
gsuiPeriodicWave.getXFromWave = function( a, b, t ) {
	var tmp, pi2 = Math.PI * 2;

	return a.reduce( ( val, ak, k ) => {
		tmp = pi2 * k * t;
		return val + ak * Math.cos( tmp ) + b[ k ] * Math.sin( tmp );
	}, 0 );
};

gsuiPeriodicWave.prototype = {
	remove() {
		delete this._attached;
		this.rootElement.remove();
	},
	attached() {
		this._attached = true;
		this.resized();
	},
	resized() {
		var { width, height } = this.rootElement.getBoundingClientRect();

		this.width = width;
		this.height = height;
		this.rootElement.setAttribute( "viewBox", "0 0 " + width + " " + height );
	},
	draw() {
		var x = 0,
			w = this.width,
			h2 = this.height / 2,
			hz = this.frequency,
			amp = -this.amplitude * h2,
			attEnd = w / hz * this.attack,
			wave = gsuiPeriodicWave.cache[ this.type ],
			pts = new Float32Array( w * 2 );

		if ( !wave ) {
			console.error( `ERROR: gsuiPeriodicWave: the wave "${ this.type }" is undefined...` );
		} else if ( this._attached ) {
			for ( ; x < w; ++x ) {
				pts[ x * 2 ] = x;
				pts[ x * 2 + 1 ] = h2 + wave[ ~~( x / w * 256 * hz % 256 ) ]
					* amp * ( x < attEnd ? x / attEnd : 1 );
			}
			this.polyline.setAttribute( "points", pts.join( " " ) );
		}
	}
};
