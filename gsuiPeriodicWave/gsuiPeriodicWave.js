"use strict";

class gsuiPeriodicWave extends gsui0ne {
	static #cache = {};
	#width = 0;
	#height = 0;
	#options = [];

	constructor() {
		super( {
			$cmpName: "gsuiPeriodicWave",
			$tagName: "gsui-periodicwave",
			$template: GSUcreateElementSVG( "svg", { preserveAspectRatio: "none", inert: true } ),
		} );
		Object.seal( this );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.$resized();
	}

	// .........................................................................
	$nbLines( n ) {
		GSUarrayLength( this.#options, n, () => Object.seal( {
			type: "",
			delay: 0,
			attack: 0,
			frequency: 1,
			amplitude: 1,
			duration: 1,
			opacity: 1,
		} ) );
		GSUsetSVGChildrenNumber( this.$element, n, "polyline" );
	}
	$options( lineN, opt ) {
		if ( this.#options[ lineN ] ) {
			Object.assign( this.#options[ lineN ], opt );
			this.#drawLine( lineN );
		}
	}
	$resized() {
		const bcr = this.getBoundingClientRect();
		const w = ~~bcr.width;
		const h = ~~bcr.height;

		this.#width = w;
		this.#height = h;
		GSUsetViewBoxWH( this.$element, w, h );
		this.#options.forEach( ( _, i ) => this.#drawLine( i ) );
	}
	#drawLine( lineN ) {
		const opt = this.#options[ lineN ];
		const wave = gsuiPeriodicWave.#cache[ opt.type ];

		if ( opt && wave ) {
			GSUsetAttribute( this.$element.children[ lineN ], {
				points: gsuiPeriodicWave.#draw( wave, opt, this.#width, this.#height ),
				"stroke-opacity": opt.opacity,
			} );
		}
	}

	// .........................................................................
	static $addWave( name, real, imag ) {
		gsuiPeriodicWave.#cache[ name ] = GSUmathRealImagToXY( real, imag, 256 );
	}
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
}

GSUdefineElement( "gsui-periodicwave", gsuiPeriodicWave );
