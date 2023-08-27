"use strict";

class gsuiPeriodicWave extends HTMLElement {
	static #cache = { noise: Array.from( { length: 256 }, () => Math.random() * 2 - 1 ) };
	#width = 0;
	#height = 0;
	#options = Object.seal( {
		type: "",
		delay: 0,
		attack: 0,
		frequency: 1,
		amplitude: 1,
		duration: 1,
	} );
	#svg = GSUcreateElementSVG( "svg", { preserveAspectRatio: "none" },
		GSUcreateElementSVG( "polyline" )
	);

	constructor() {
		super();
		Object.seal( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( this.#svg );
			this.$resized();
		}
	}

	// .........................................................................
	$options( opt ) {
		Object.assign( this.#options, opt );
		this.$draw();
	}
	$resized() {
		const bcr = this.getBoundingClientRect();
		const w = ~~bcr.width;
		const h = ~~bcr.height;

		this.#width = w;
		this.#height = h;
		GSUsetAttribute( this.#svg, "viewBox", `0 0 ${ w } ${ h }` );
		this.$draw();
	}
	$draw() {
		const type = this.#options.type;

		if ( this.firstChild && type ) {
			const wave = gsuiPeriodicWave.#cache[ type ];

			if ( wave ) {
				GSUsetAttribute( this.#svg.firstChild, "points",
					gsuiPeriodicWave.#draw( wave, this.#options, this.#width, this.#height ) );
			} else {
				console.error( `gsuiPeriodicWave: unknown wave "${ type }"` );
			}
		}
	}

	// .........................................................................
	static #draw( wave, opt, w, h ) {
		const hz = opt.frequency * opt.duration;
		const amp = -opt.amplitude * .95 * h / 2;
		const delX = w / opt.duration * opt.delay;
		const attX = w / opt.duration * opt.attack;
		const pts = new Float32Array( w * 2 );

		for ( let x = 0; x < w; ++x ) {
			let y = h / 2;

			if ( x > delX ) {
				const xd = x - delX;
				const att = xd < attX ? xd / attX : 1;

				y += wave[ xd / w * 256 * hz % 256 | 0 ] * amp * att;
			}
			pts[ x * 2 ] = x;
			pts[ x * 2 + 1 ] = y;
		}
		return pts.join( " " );
	}
	static $addWave( name, real, imag ) {
		if ( !gsuiPeriodicWave.#cache[ name ] ) {
			const arr = [];
			const fn = gsuiPeriodicWave.#getXFromWave.bind( null, real, imag );

			for ( let x = 0; x < 256; ++x ) {
				arr.push( fn( x / 256 ) );
			}
			gsuiPeriodicWave.#cache[ name ] = arr;
		}
	}
	static #getXFromWave( a, b, t ) {
		return a.reduce( ( val, ak, k ) => {
			const tmp = Math.PI * 2 * k * t;

			return val + ak * Math.cos( tmp ) + b[ k ] * Math.sin( tmp );
		}, 0 );
	}
}

Object.freeze( gsuiPeriodicWave );
customElements.define( "gsui-periodicwave", gsuiPeriodicWave );
