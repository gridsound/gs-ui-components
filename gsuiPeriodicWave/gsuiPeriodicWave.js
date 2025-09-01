"use strict";

class gsuiPeriodicWave extends gsui0ne {
	static #cache = {};
	#options = [];

	constructor() {
		super( {
			$cmpName: "gsuiPeriodicWave",
			$tagName: "gsui-periodicwave",
			$template: GSUcreateElement( "svg", { preserveAspectRatio: "none", inert: true } ),
		} );
		Object.seal( this );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.$resized();
	}

	// .........................................................................
	$getY( lineN, xBeat ) {
		return gsuiPeriodicWave.#getY( this.#getDrawData( lineN ), xBeat );
	}
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
		GSUdomSetChildrenLength( this.$element, n, "polyline" );
	}
	$options( lineN, opt ) {
		if ( this.#options[ lineN ] ) {
			Object.assign( this.#options[ lineN ], opt );
			this.#drawLine( lineN );
		}
	}
	$resized() {
		GSUsetViewBoxWH( this.$element, this.clientWidth, this.clientHeight );
		this.#options.forEach( ( _, i ) => this.#drawLine( i ) );
	}
	#drawLine( lineN ) {
		const opt = this.#options[ lineN ];

		if ( opt && opt.type in gsuiPeriodicWave.#cache ) {
			GSUdomSetAttr( this.$element.children[ lineN ], {
				points: gsuiPeriodicWave.#draw( this.#getDrawData( lineN ) ),
				"stroke-opacity": opt.opacity,
			} );
		}
	}
	#getDrawData( lineN ) {
		const w = this.clientWidth;
		const h = this.clientHeight;
		const opt = this.#options[ lineN ];

		return {
			w,
			h,
			wave: gsuiPeriodicWave.#cache[ opt.type ],
			delX: w / opt.duration * opt.delay,
			attX: w / opt.duration * opt.attack,
			amp: -opt.amplitude * .95,
			hz: opt.frequency * opt.duration,
		};
	}

	// .........................................................................
	static $addWave( name, real, imag ) {
		gsuiPeriodicWave.#cache[ name ] = GSUmathRealImagToXY( real, imag, 256 );
	}
	static #draw( drawInfo ) {
		const pts = new Float32Array( drawInfo.w * 2 );

		for ( let x = 0; x < drawInfo.w; ++x ) {
			pts[ x * 2 ] = x;
			pts[ x * 2 + 1 ] = drawInfo.h / 2 + gsuiPeriodicWave.#getY( drawInfo, x ) * drawInfo.h / 2;
		}
		return pts.join( " " );
	}
	static #getY( { w, wave, delX, attX, amp, hz }, x ) {
		if ( x > delX ) {
			const xd = x - delX;
			const att = xd < attX ? xd / attX : 1;

			return wave[ xd / w * 256 * hz % 256 | 0 ] * amp * att;
		}
		return 0;
	}
}

GSUdomDefine( "gsui-periodicwave", gsuiPeriodicWave );
