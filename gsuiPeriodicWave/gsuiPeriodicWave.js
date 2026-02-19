"use strict";

class gsuiPeriodicWave extends gsui0ne {
	static #cache = {};
	#opts = Object.seal( {
		type: "",
		delay: 0,
		attack: 0,
		frequency: 1,
		amplitude: 1,
		duration: 1,
		opacity: 1,
	} );

	constructor() {
		super( {
			$cmpName: "gsuiPeriodicWave",
			$tagName: "gsui-periodicwave",
			$template: GSUcreateElement( "svg", { preserveAspectRatio: "none", inert: true },
				GSUcreateElement( "polyline" ),
			),
		} );
		Object.seal( this );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.$resized();
	}

	// .........................................................................
	$getY( xBeat ) {
		return gsuiPeriodicWave.#getY( this.#getDrawData(), xBeat );
	}
	$options( opt ) {
		Object.assign( this.#opts, opt );
		this.#drawLine();
	}
	$resized() {
		this.$element.$viewbox( this.clientWidth, this.clientHeight );
		this.#drawLine();
	}
	#drawLine() {
		if ( this.#opts.type in gsuiPeriodicWave.#cache ) {
			this.$element.$child( 0 ).$setAttr( {
				points: gsuiPeriodicWave.#draw( this.#getDrawData() ),
				"stroke-opacity": this.#opts.opacity,
			} );
		}
	}
	#getDrawData() {
		const w = this.clientWidth;
		const h = this.clientHeight;
		const opt = this.#opts;

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
