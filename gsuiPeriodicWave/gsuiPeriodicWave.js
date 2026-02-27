"use strict";

class gsuiPeriodicWave extends gsui0ne {
	#waveArray = null;
	#needRedraw = true;
	#drawData = Object.seal( {
		w: 100,
		h: 100,
		wave: [ 0, 0 ],
		delX: 0,
		attX: 0,
		amp: .95,
		hz: 1,
	} );

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
	static get observedAttributes() {
		return [ "frequency", "amplitude", "duration", "delay", "attack" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "delay":
			case "attack":
			case "amplitude":
			case "frequency":
			case "duration":
				this.#needRedraw = true;
				break;
		}
	}
	$onmessage( ev, val, w ) {
		switch ( ev ) {
			case GSEV_PERIODICWAVE_GETY: return gsuiPeriodicWave.#getY( this.#getDrawData(), val );
			case GSEV_PERIODICWAVE_DRAW: this.#draw(); break;
			case GSEV_PERIODICWAVE_DATA: this.#data( val, w ); break;
			case GSEV_PERIODICWAVE_RESIZE:
				this.$element.$viewbox( this.clientWidth, this.clientHeight );
				this.#needRedraw = true;
				break;
		}
	}

	// .........................................................................
	#data( arr, w ) {
		if ( arr ) {
			this.#waveArray = !w ? [ ...arr ] : GSUarrayResize( arr, w );
		}
		this.#needRedraw = !!arr;
	}
	#draw() {
		if ( this.#waveArray && this.clientWidth > 0 ) {
			this.$element.$child( 0 ).$setAttr( {
				points: gsuiPeriodicWave.#getPoints( this.#getDrawData() ),
				"stroke-opacity": this.$this.$getAttr( "opacity" ) || 1,
			} );
		}
	}
	#getDrawData() {
		if ( this.#needRedraw ) {
			this.#updateDrawData();
		}
		return this.#drawData;
	}
	#updateDrawData() {
		const [ freq, amp, dur, delay, attack ] = this.$this.$getAttr( "frequency", "amplitude", "duration", "delay", "attack" );
		const o = this.#drawData;

		o.w = this.clientWidth;
		o.h = this.clientHeight;
		o.hz = freq * dur;
		o.wave = GSUarrayResize( this.#waveArray, Math.max( o.w / o.hz | 0, 2 ) );
		o.delX = o.w / dur * delay;
		o.attX = o.w / dur * attack;
		o.amp = -amp * .95;
		this.#needRedraw = false;
	}

	// .........................................................................
	static #getPoints( drawInfo ) {
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
			const wlen = wave.length - 1;
			const x2 = x - delX;
			const x3 = x2 / w * wlen * hz % wlen;
			const att = x2 < attX ? x2 / attX : 1;

			return wave[ x3 | 0 ] * amp * att;
		}
		return 0;
	}
}

GSUdomDefine( "gsui-periodicwave", gsuiPeriodicWave );
