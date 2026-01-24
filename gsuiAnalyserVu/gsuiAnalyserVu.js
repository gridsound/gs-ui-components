"use strict";

class gsuiAnalyserVu extends gsui0ne {
	#dBmax = 1;
	#chans = [];

	constructor() {
		super( {
			$cmpName: "gsuiAnalyserVu",
			$tagName: "gsui-analyser-vu",
			$elements: {
				$L: "[data-chan=L]",
				$R: "[data-chan=R]",
				$0dB: ".gsuiAnalyserVu-meter-0dB",
			},
			$attributes: {
				max: 100,
			},
		} );
		Object.seal( this );

		const els = this.$elements;
		const L = {
			$max: 0,
			$elVal: els.$L.$child( 0 ),
			$elMax: els.$L.$child( 0 ).$child( 0 ),
			$elTick: els.$L.$child( 1 ),
		};
		const R = {
			$max: 0,
			$elVal: els.$R.$child( 0 ),
			$elMax: els.$R.$child( 0 ).$child( 0 ),
			$elTick: els.$R.$child( 1 ),
		};

		L.$fall = GSUdebounce( this.#maxFall.bind( this, L ), 1 );
		R.$fall = GSUdebounce( this.#maxFall.bind( this, R ), 1 );
		this.#chans.push( L, R );
	}
	static get observedAttributes() {
		return [ "max" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "max":
				this.#dBmax = +val;
				this.#updateMaxLine();
				break;
		}
	}

	// .........................................................................
	$draw( dataL, dataR ) {
		const L = gsuiAnalyserVu.#getMax( dataL ) * 100;
		const R = gsuiAnalyserVu.#getMax( dataR ) * 100;

		this.#drawChan( this.#chans[ 0 ], L );
		this.#drawChan( this.#chans[ 1 ], R );
	}

	// .........................................................................
	#cssVal( n ) {
		return `${ Math.min( n / this.#dBmax * 100, 100 ) }%`;
	}
	#updateMaxLine() {
		const bot = this.#cssVal( 100 );
		const bot2 = bot === "100%" ? "200%" : bot;

		this.$elements.$0dB.$css( "bottom", bot2 );
	}
	#drawChan( chan, max ) {
		const h = this.#cssVal( max );
		const hmax = Math.max( 0, ( 1 - 100 / Math.min( this.#dBmax, max ) ) * 100 );

		chan.$elVal.$css( "height", h );
		chan.$elMax.$height( hmax, "%" );
		if ( max > chan.$max ) {
			GSUclearInterval( chan.$intervalID );
			chan.$elTick.$css( {
				opacity: 1,
				bottom: h,
				backgroundColor: max <= 100 ? "" : "var(--gsuiAnalyserVu-max-col)",
			} );
			chan.$max = max;
			chan.$fall();
		}
	}
	#maxFall( chan ) {
		chan.$intervalID = GSUsetInterval( this.#maxFallFrame.bind( this, chan ), 1 / 60 );
	}
	#maxFallFrame( chan ) {
		chan.$max -= 1;
		if ( chan.$max > 0 ) {
			chan.$elTick.$css( "bottom", this.#cssVal( chan.$max ) );
		} else {
			GSUclearInterval( chan.$intervalID );
			chan.$max = 0;
			chan.$elTick.$css( {
				opacity: 0,
				bottom: "calc(0% + 2px)",
			} );
		}
	}
	static #getMax( arr ) {
		return Array.prototype.reduce.call( arr, ( res, n ) => Math.max( res, Math.abs( n ) ), 0 );
	}
}

GSUdomDefine( "gsui-analyser-vu", gsuiAnalyserVu );
