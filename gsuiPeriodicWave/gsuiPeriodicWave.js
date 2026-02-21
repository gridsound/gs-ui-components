"use strict";

class gsuiPeriodicWave extends gsui0ne {
	#waveArray = null;

	constructor() {
		super( {
			$cmpName: "gsuiPeriodicWave",
			$tagName: "gsui-periodicwave",
			$template: GSUcreateElement( "svg", { preserveAspectRatio: "none", inert: true },
				GSUcreateElement( "polyline" ),
			),
			$attributes: {
				frequency: 1,
				amplitude: 1,
				duration: 1,
				delay: 0,
				attack: 0,
			},
		} );
		Object.seal( this );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.$onmessage( GSEV_PERIODICWAVE_RESIZE );
	}
	$onmessage( ev, val, w ) {
		switch ( ev ) {
			case GSEV_PERIODICWAVE_GETY: return gsuiPeriodicWave.#getY( this.#getDrawData(), val );
			case GSEV_PERIODICWAVE_DRAW: this.#drawLine(); break;
			case GSEV_PERIODICWAVE_DATA: this.#waveArray = val && GSUarrayResize( val, w ?? this.clientWidth ); break;
			case GSEV_PERIODICWAVE_RESIZE: this.$element.$viewbox( this.clientWidth, this.clientHeight ); break;
		}
	}

	// .........................................................................
	#drawLine() {
		if ( this.#waveArray && this.clientWidth > 0 ) {
			this.$element.$child( 0 ).$setAttr( {
				points: gsuiPeriodicWave.#draw( this.#getDrawData() ),
				"stroke-opacity": this.$this.$getAttr( "opacity" ) || 1,
			} );
		}
	}
	#getDrawData() {
		const w = this.clientWidth;
		const h = this.clientHeight;
		const [ type, hz, amp, dur, delay, attack ] = this.$this.$getAttr( "type", "frequency", "amplitude", "duration", "delay", "attack" );

		return {
			w,
			h,
			wave: this.#waveArray,
			delX: w / dur * delay,
			attX: w / dur * attack,
			amp: -amp * .95,
			hz: hz * dur,
		};
	}

	// .........................................................................
	static #draw( drawInfo ) {
		const w = drawInfo.w;
		const h2 = drawInfo.h / 2;
		const pts = GSUnewArray( w, i => [
			i,
			h2 + h2 * gsuiPeriodicWave.#getY( drawInfo, i ),
		] );

		pts.unshift(
			[ -10, h2 ],
			[ -10, pts[ 0 ][ 1 ] ],
		);
		pts.push(
			[ w + 10, pts.at( -1 )[ 1 ] ],
			[ w + 10, h2 ],
		);
		return pts.join( " " );
	}
	static #getY( { w, wave, delX, attX, amp, hz }, x ) {
		if ( x >= delX ) {
			const xd = x - delX;
			const att = xd < attX ? xd / attX : 1;

			return wave[ xd / w * wave.length * hz % wave.length | 0 ] * amp * att;
		}
		return 0;
	}
}

GSUdomDefine( "gsui-periodicwave", gsuiPeriodicWave );
