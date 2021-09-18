"use strict";

class gsuiPeriodicWave extends HTMLElement {
	#svg = GSUI.createElementSVG( "svg", { preserveAspectRatio: "none" },
		GSUI.createElementSVG( "polyline" )
	)
	static cache = {}

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
		const bcr = this.getBoundingClientRect(),
			w = ~~bcr.width,
			h = ~~bcr.height;

		this.width = w;
		this.height = h;
		GSUI.setAttribute( this.#svg, "viewBox", `0 0 ${ w } ${ h }` );
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
		const dur = this.duration,
			w = this.width,
			h2 = this.height / 2,
			hz = this.frequency * dur,
			amp = -this.amplitude * .95 * h2,
			delX = w / dur * this.delay,
			attX = w / dur * this.attack,
			pts = new Float32Array( w * 2 );

		for ( let x = 0; x < w; ++x ) {
			let y = h2;

			if ( x > delX ) {
				const xd = x - delX,
					att = xd < attX ? xd / attX : 1;

				y += wave[ xd / w * 256 * hz % 256 | 0 ] * amp * att;
			}
			pts[ x * 2 ] = x;
			pts[ x * 2 + 1 ] = y;
		}
		GSUI.setAttribute( this.#svg.firstChild, "points", pts.join( " " ) );
	}

	// .........................................................................
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

Object.freeze( gsuiPeriodicWave );
customElements.define( "gsui-periodicwave", gsuiPeriodicWave );

gswaPeriodicWaves.list.forEach( ( w, name ) => {
	gsuiPeriodicWave.addWave( name, w.real, w.imag );
} );
