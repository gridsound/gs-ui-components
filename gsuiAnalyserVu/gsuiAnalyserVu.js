"use strict";

class gsuiAnalyserVu extends gsui0ne {
	#maxs = [ 0, 0 ];
	#dBmax = 1;
	#intervalIDs = {};
	#maxFallDeb = [
		GSUdebounce( this.#maxFall.bind( this, 0 ), 1 ),
		GSUdebounce( this.#maxFall.bind( this, 1 ), 1 ),
	];

	constructor() {
		super( {
			$cmpName: "gsuiAnalyserVu",
			$tagName: "gsui-analyser-vu",
			$elements: {
				$metersVal: "[].gsuiAnalyserVu-meter-val",
				$metersValMax: "[].gsuiAnalyserVu-meter-val-max",
				$metersTick: "[].gsuiAnalyserVu-meter-tick",
				$meters0dB: "[].gsuiAnalyserVu-meter-0dB",
			},
			$attributes: {
				max: 100,
			}
		} );
		Object.seal( this );
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
		const maxs = [
			gsuiAnalyserVu.#getMax( dataL ) * 100,
			gsuiAnalyserVu.#getMax( dataR ) * 100,
		];

		this.#drawChan( 0, maxs );
		this.#drawChan( 1, maxs );
	}

	// .........................................................................
	#cssVal( n ) {
		return `${ Math.min( n / this.#dBmax * 100, 100 ) }%`;
	}
	#updateMaxLine() {
		const bot = this.#cssVal( 100 );
		const bot2 = bot === "100%" ? "200%" : bot;

		this.$elements.$meters0dB[ 0 ].style.bottom =
		this.$elements.$meters0dB[ 1 ].style.bottom = bot2;
	}
	#drawChan( c, maxs ) {
		const max = maxs[ c ];
		const h = this.#cssVal( max );
		const hmax = Math.max( 0, ( 1 - 100 / Math.min( this.#dBmax, max ) ) * 100 );

		this.$elements.$metersVal[ c ].style.height = h;
		this.$elements.$metersValMax[ c ].style.height = `${ hmax }%`;
		if ( max > this.#maxs[ c ] ) {
			GSUclearInterval( this.#intervalIDs[ c ] );
			GSUsetStyle( this.$elements.$metersTick[ c ], {
				opacity: 1,
				bottom: h,
				backgroundColor: max <= 100 ? "" : "var(--gsuiAnalyserVu-max-col)",
			} );
			this.#maxs[ c ] = max;
			this.#maxFallDeb[ c ]();
		}
	}
	#maxFall( c ) {
		this.#intervalIDs[ c ] = GSUsetInterval( () => {
			const maxSt = this.$elements.$metersTick[ c ].style;

			this.#maxs[ c ] -= 1;
			if ( this.#maxs[ c ] <= 0 ) {
				GSUclearInterval( this.#intervalIDs[ c ] );
				this.#maxs[ c ] = 0;
				maxSt.opacity = 0;
				maxSt.bottom = "calc(0% + 2px)";
			} else {
				maxSt.bottom = this.#cssVal( this.#maxs[ c ] );
			}
		}, 1 / 60 );
	}
	static #getMax( arr ) {
		return Array.prototype.reduce.call( arr, ( res, n ) => Math.max( res, Math.abs( n ) ), 0 );
	}
}

GSUdomDefine( "gsui-analyser-vu", gsuiAnalyserVu );
