"use strict";

class gsuiPeriodicWave extends HTMLElement {
	#svg = GSUI.$createElementSVG( "svg", { preserveAspectRatio: "none" },
		GSUI.$createElementSVG( "polyline" )
	);
	static cache = {};

	constructor() {
		super();
		this.type = "";
		this.delay =
		this.attack = 0;
		this.frequency =
		this.amplitude =
		this.duration = 1;
		this.width =
		this.height = 0;
		Object.seal( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( this.#svg );
			this.resized();
		}
	}

	// .........................................................................
	resized() {
		const bcr = this.getBoundingClientRect();
		const w = ~~bcr.width;
		const h = ~~bcr.height;

		this.width = w;
		this.height = h;
		GSUI.$setAttribute( this.#svg, "viewBox", `0 0 ${ w } ${ h }` );
		this.draw();
	}
	draw() {
		if ( this.firstChild && this.type ) {
			const wave = gsuiPeriodicWave.cache[ this.type ];

			if ( wave ) {
				this.#draw( wave );
			} else {
				console.error( `gsuiPeriodicWave: the wave "${ this.type }" is undefined...` );
			}
		}
	}
	#draw( wave ) {
		const dur = this.duration;
		const w = this.width;
		const h2 = this.height / 2;
		const hz = this.frequency * dur;
		const amp = -this.amplitude * .95 * h2;
		const delX = w / dur * this.delay;
		const attX = w / dur * this.attack;
		const pts = new Float32Array( w * 2 );

		for ( let x = 0; x < w; ++x ) {
			let y = h2;

			if ( x > delX ) {
				const xd = x - delX;
				const att = xd < attX ? xd / attX : 1;

				y += wave[ xd / w * 256 * hz % 256 | 0 ] * amp * att;
			}
			pts[ x * 2 ] = x;
			pts[ x * 2 + 1 ] = y;
		}
		GSUI.$setAttribute( this.#svg.firstChild, "points", pts.join( " " ) );
	}

	// .........................................................................
	static getXFromWave( a, b, t ) {
		return a.reduce( ( val, ak, k ) => {
			const tmp = Math.PI * 2 * k * t;

			return val + ak * Math.cos( tmp ) + b[ k ] * Math.sin( tmp );
		}, 0 );
	}
	static addWave( name, real, imag ) {
		if ( !gsuiPeriodicWave.cache[ name ] ) {
			const arr = [];
			const fn = gsuiPeriodicWave.getXFromWave.bind( null, real, imag );

			for ( let x = 0; x < 256; ++x ) {
				arr.push( fn( x / 256 ) );
			}
			gsuiPeriodicWave.cache[ name ] = arr;
		}
	}
}

Object.freeze( gsuiPeriodicWave );
customElements.define( "gsui-periodicwave", gsuiPeriodicWave );
