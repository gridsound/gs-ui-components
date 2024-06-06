"use strict";

class gsuiAnalyserTime extends gsui0ne {
	#ctx = null;
	#pinch = 0;
	#setResDeb = GSUdebounce( this.$setResolution.bind( this ), 200 );

	constructor() {
		super( {
			$cmpName: "gsuiAnalyserTime",
			$tagName: "gsui-analysertime",
			$template: GSUcreateElement( "canvas" ),
			$attributes: {
				pinch: 1,
			},
		} );
		Object.seal( this );
		this.#ctx = this.$element.getContext( "2d" );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "pinch" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "pinch": this.#pinch = +val; break;
		}
	}
	$onresize( w, h ) {
		this.#setResDeb( w, h );
	}

	// .........................................................................
	$clear() {
		this.#ctx.clearRect( 0, 0, this.$element.width, this.$element.height );
	}
	$setResolution( w, h ) {
		this.$element.width = w;
		this.$element.height = h;
	}
	$draw( data ) {
		const ctx = this.#ctx;
		const xInc = this.$element.width / data.length;
		const calcY = gsuiAnalyserTime.#calcY.bind( null, data, this.$element.height / 2, this.#pinch / 2 );

		this.$clear();
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo( 0, calcY( 0 ) );
		for ( let i = 1; i < data.length; ++i ) {
			ctx.lineTo( i * xInc, calcY( i ) );
		}
		ctx.stroke();
	}
	static #calcY( data, h2, pin, i ) {
		const perc = i / data.length;
		const pin2 =
			perc <     pin ?       perc   / pin :
			perc > 1 - pin ? ( 1 - perc ) / pin : 1;
		const d = data[ i ] / 256 * 2 - 1;

		return h2 + d * pin2 * h2;
	}
}

Object.freeze( gsuiAnalyserTime );
customElements.define( "gsui-analysertime", gsuiAnalyserTime );
