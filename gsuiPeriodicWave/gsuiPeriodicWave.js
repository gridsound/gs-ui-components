"use strict";

class gsuiPeriodicWave {
	constructor( svg ) {
		const root = svg || document.createElementNS( "http://www.w3.org/2000/svg", "svg" );

		this.rootElement = root;
		this.polyline = root.querySelector( "polyline" );
		if ( !this.polyline ) {
			this.polyline = document.createElementNS( "http://www.w3.org/2000/svg", "polyline" );
			root.appendChild( this.polyline );
		}
		this.type = "";
		this.attack = 0;
		this.frequency = 1;
		this.amplitude = 1;
		this._attached = false;
		this.width =
		this.height = 0;
		Object.seal( this );

		root.setAttribute( "preserveAspectRatio", "none" );
		root.classList.add( "gsuiPeriodicWave" );
	}

	remove() {
		delete this._attached;
		this.rootElement.remove();
	}
	attached() {
		this._attached = true;
		this.resized();
	}
	resized() {
		const bcr = this.rootElement.getBoundingClientRect(),
			w = ~~bcr.width,
			h = ~~bcr.height;

		this.width = w;
		this.height = h;
		this.rootElement.setAttribute( "viewBox", `0 0 ${ w } ${ h }` );
		if ( this.type ) {
			this.draw();
		}
	}
	draw() {
		const w = this.width,
			h2 = this.height / 2,
			hz = this.frequency,
			amp = -this.amplitude * h2,
			attEnd = w / hz * this.attack,
			wave = gsuiPeriodicWave.cache[ this.type ],
			pts = new Float32Array( w * 2 );

		if ( !wave ) {
			console.error( `ERROR: gsuiPeriodicWave: the wave "${ this.type }" is undefined...` );
		} else if ( this._attached ) {
			for ( let x = 0; x < w; ++x ) {
				pts[ x * 2 ] = x;
				pts[ x * 2 + 1 ] = h2 + wave[ ~~( x / w * 256 * hz % 256 ) ]
					* amp * ( x < attEnd ? x / attEnd : 1 );
			}
			this.polyline.setAttribute( "points", pts.join( " " ) );
		}
	}

	// static:
	static getXFromWave( a, b, t ) {
		return a.reduce( ( val, ak, k ) => {
			const tmp = Math.PI * 2 * k * t;

			return val + ak * Math.cos( tmp ) + b[ k ] * Math.sin( tmp );
		}, 0 );
	}
	static addWave( name, real, imag ) {
		const cache = gsuiPeriodicWave.cache;

		if ( !cache[ name ] ) {
			const arr = [],
				fn = gsuiPeriodicWave.getXFromWave.bind( null, real, imag );

			for ( let x = 0; x < 256; ++x ) {
				arr.push( fn( x / 256 ) );
			}
			cache[ name ] = arr;
		}
	}
}

gsuiPeriodicWave.cache = {};

Object.freeze( gsuiPeriodicWave );
