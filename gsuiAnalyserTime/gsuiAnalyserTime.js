"use strict";

class gsuiAnalyserTime extends gsui0ne {
	#ctx = null;
	#amp = 1;
	#pinch = 0;
	#color = "#fff";
	#setResDeb = GSUdebounce( this.#setResolution.bind( this ), 200 );

	constructor() {
		super( {
			$cmpName: "gsuiAnalyserTime",
			$tagName: "gsui-analysertime",
			$template: GSUcreateElement( "canvas" ),
			$attributes: {
				amp: 1,
				pinch: 1,
				color: "#fff",
			},
		} );
		Object.seal( this );
		this.#ctx = this.$element.getContext( "2d" );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "amp", "color", "pinch" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "amp": this.#amp = +val; break;
			case "color": this.#color = val; break;
			case "pinch": this.#pinch = +val; break;
		}
	}
	$onresize( w, h ) {
		this.#setResDeb( w, h );
	}
	#setResolution( w, h ) {
		this.$element.width = w;
		this.$element.height = h;
	}

	// .........................................................................
	$clear() {
		this.#ctx.clearRect( 0, 0, this.$element.width, this.$element.height );
	}
	$draw( data ) {
		const ctx = this.#ctx;
		const xInc = this.$element.width / data.length;
		const calcY = gsuiAnalyserTime.#calcY.bind( null, data, this.#amp, this.$element.height / 2, this.#pinch / 2 );

		this.$clear();
		ctx.strokeStyle = this.#color;
		ctx.lineWidth = Math.max( 2, this.$element.height / 150 );
		ctx.beginPath();
		ctx.moveTo( 0, calcY( 0 ) );
		for ( let i = 1; i < data.length; ++i ) {
			ctx.lineTo( i * xInc, calcY( i ) );
		}
		ctx.stroke();
	}
	static #calcY( data, amp, h2, pin, i ) {
		const perc = i / ( data.length - 1 );
		const pin2 =
			perc <     pin ?       perc   / pin :
			perc > 1 - pin ? ( 1 - perc ) / pin : 1;
		const d = data[ i ] / 256 * 2 - 1;
		const d2 = Math.max( -1, Math.min( d * amp, 1 ) );

		return h2 + d2 * GSUeaseOutCirc( pin2 ) * h2;
	}
}

GSUdefineElement( "gsui-analysertime", gsuiAnalyserTime );
