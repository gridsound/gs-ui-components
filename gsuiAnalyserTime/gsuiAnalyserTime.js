"use strict";

class gsuiAnalyserTime extends gsui0ne {
	#ctx = null;
	#amp = 1;
	#pinch = 0;
	#color = "#fff";
	#smooth = 0;
	#drawMax = 0;
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
				smooth: 0,
			},
		} );
		Object.seal( this );
		this.#ctx = this.$element.getContext( "2d" );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "amp", "color", "pinch", "smooth" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "amp": this.#amp = +val; break;
			case "color": this.#color = val; break;
			case "pinch": this.#pinch = +val; break;
			case "smooth": this.#smooth = GSUeaseOutCirc( +val ); break;
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
		const w = this.$element.width;
		const h = this.$element.height;
		const xInc = w / data.length;
		const calcY = gsuiAnalyserTime.#calcY.bind( null, data, this.#amp, h / 2, this.#pinch / 2 );
		const r = Math.round( 255 - this.#drawMax * 255 );
		const g = Math.round( this.#drawMax *  64 );
		const b = Math.round( this.#drawMax * 255 );

		ctx.globalCompositeOperation = "source-in";
		ctx.fillStyle = `rgba(${ r },${ g },${ b },${ this.#smooth })`;
		ctx.globalAlpha = 1;
		ctx.fillRect( 0, 0, w, h );
		ctx.beginPath();
		ctx.moveTo( 0, calcY( 0 ) );
		this.#drawMax = 0;
		for ( let i = 1; i < data.length; ++i ) {
			this.#drawMax = Math.max( Math.abs( data[ i ] ), this.#drawMax );
			ctx.lineTo( i * xInc, calcY( i ) );
		}
		ctx.globalCompositeOperation = "source-over";
		ctx.lineWidth = Math.max( 2, h / 150 ) + Math.round( 1 * this.#drawMax );
		ctx.strokeStyle = this.#color;
		ctx.globalAlpha = GSUeaseOutCirc( this.#drawMax, 8 );
		ctx.stroke();
	}
	static #calcY( data, amp, h2, pin, i ) {
		const perc = i / ( data.length - 1 );
		const pin2 =
			perc <     pin ?       perc   / pin :
			perc > 1 - pin ? ( 1 - perc ) / pin : 1;
		const d2 = Math.max( -1, Math.min( data[ i ] * amp, 1 ) );

		return h2 + d2 * GSUeaseOutCirc( pin2 ) * h2;
	}
}

GSUdefineElement( "gsui-analysertime", gsuiAnalyserTime );
