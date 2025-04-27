"use strict";

class gsuiSlider extends gsui0ne {
	#min = 0;
	#max = 100;
	#step = 1;
	#value = 0;
	#revert = 1;
	#valueSave = 0;
	#scrollStep = 0;
	#scrollIncr = 0;
	#strokeWidth = 4;
	#mousemoveSize = 0;
	#circ = false;
	#axeX = false;
	#pxval = 0;
	#pxmoved = 0;
	#svgLineLen = 0;
	#onwheelBinded = this.#onwheel.bind( this );

	constructor() {
		super( {
			$cmpName: "gsuiSlider",
			$tagName: "gsui-slider",
			$elements: {
				$line: ".gsuiSlider-line",
				$lineColor: ".gsuiSlider-lineColor",
				$svg: ".gsuiSlider-svg",
				$svgLine: ".gsuiSlider-svgLine",
				$svgLineColor: ".gsuiSlider-svgLineColor",
			},
			$attributes: {
				min: 0,
				max: 100,
				step: 1,
				value: 0,
			},
			$ptrlock: true,
		} );
		Object.seal( this );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.#setSVGcirc();
		this.#updateVal( this.#value );
	}
	$connected() {
		this.#updateVal( this.#value );
	}
	static get observedAttributes() {
		return [ "value", "revert", "type", "min", "max", "step", "scroll-step", "mousemove-size", "stroke-width" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "min": this.#min = +val; break;
			case "max": this.#max = +val; break;
			case "step": this.#step = +val; break;
			case "value": this.#value = +val; break;
			case "type": this.#setType( val ); break;
			case "revert": this.#revert = val !== null ? -1 : 1; break;
			case "scroll-step": this.#scrollStep = +val; break;
			case "stroke-width": this.#strokeWidth = +val; break;
			case "mousemove-size": this.#mousemoveSize = +val; break;
		}
		switch ( prop ) {
			case "type":
			case "min":
			case "max":
			case "step":
			case "value":
				this.#updateVal( this.#value );
				break;
			case "type":
			case "stroke-width":
				this.#setSVGcirc();
				break;
		}
	}

	// .........................................................................
	#setType( type ) {
		const circ = type === "circular";
		const axeX = type === "linear-x";

		this.#circ = circ;
		this.#axeX = axeX;
		this.classList.toggle( "gsuiSlider-circular", circ );
		this.classList.toggle( "gsuiSlider-linear", !circ );
		if ( !circ ) {
			GSUsetStyle( this.$elements.$lineColor, {
				top: axeX ? "0" : "",
				left: axeX ? "" : "0",
				width: axeX ? "" : "100%",
				height: axeX ? "100%" : "",
			} );
		}
	}
	#setSVGcirc() {
		if ( this.#circ && this.$isConnected ) {
			const size = Math.min( this.clientWidth, this.clientHeight );
			const cx = size / 2;
			const r = ~~( ( size - this.#strokeWidth ) / 2 );

			GSUsetViewBoxWH( this.$elements.$svg, size, size );
			GSUsetAttribute( this.$elements.$svgLine, { r, cx, cy: cx, } );
			GSUsetAttribute( this.$elements.$svgLineColor, { r, cx, cy: cx, } );
			this.$elements.$svgLine.style.strokeWidth =
			this.$elements.$svgLineColor.style.strokeWidth = this.#strokeWidth;
			this.#svgLineLen = r * 2 * Math.PI;
		}
	}
	#getRange() {
		return this.#max - this.#min;
	}
	#formatValue( val ) {
		return GSUMathRound( GSUclampNum( val, this.#min, this.#max ), this.#step );
	}
	#getMousemoveSize() {
		return this.#mousemoveSize || (
			this.#circ
				? this.#svgLineLen
				: this.#axeX
					? this.$elements.$line.getBoundingClientRect().width
					: this.$elements.$line.getBoundingClientRect().height
		);
	}
	#updateVal( val ) {
		if ( this.$isConnected ) {
			const len = this.#getRange();
			const prcval = ( val - this.#min ) / len;
			const prcstart = -this.#min / len;
			const prclen = Math.abs( prcval - prcstart );
			const prcmin = Math.min( prcval, prcstart );

			if ( this.#circ ) {
				GSUsetStyle( this.$elements.$svgLineColor, {
					transform: `rotate(${ 90 + prcmin * 360 }deg)`,
					strokeDasharray: `${ prclen * this.#svgLineLen }, 999999`,
				} );
			} else {
				GSUsetStyle( this.$elements.$lineColor, this.#axeX
					? {
						left:  `${ prcmin * 100 }%`,
						width: `${ prclen * 100 }%`,
					} : {
						bottom: `${ prcmin * 100 }%`,
						height: `${ prclen * 100 }%`,
					} );
			}
		}
	}
	#onchange() {
		if ( this.#value !== this.#valueSave ) {
			this.#valueSave = this.#value;
			GSUsetAttribute( this, "value", this.#value );
			this.$dispatch( "change", this.#value );
		}
	}
	#oninput( val ) {
		if ( val !== this.#value ) {
			this.#value = val;
			this.$dispatch( "input", +val );
		}
	}

	// .........................................................................
	#onwheel( e ) {
		if ( this.$isActive ) {
			const d = e.deltaY > 0 ? -1 : 1;
			const step = this.#scrollStep || this.#step;
			const val = this.#formatValue( this.#value + step * d );

			this.#scrollIncr += step * d;
			this.#updateVal( val );
			this.#oninput( val );
			e.preventDefault();
			return false;
		}
	}
	$onptrdown( e ) {
		e.preventDefault();
		if ( e.button !== 0 || GSUhasAttribute( this, "disabled" ) ) {
			return false;
		}
		this.#valueSave = this.#value;
		this.#pxval = this.#getRange() / this.#getMousemoveSize();
		this.#pxmoved = 0;
		this.#scrollIncr = 0;
		document.body.addEventListener( "wheel", this.#onwheelBinded, { passive: false } );
		this.$dispatch( "inputStart", this.#value );
	}
	$onptrmove( e ) {
		const bound = this.#getRange() / 5;
		const mov = ( this.#circ || !this.#axeX ? -e.movementY : e.movementX ) * this.#revert;
		const val = this.#valueSave + ( this.#pxmoved + mov ) * this.#pxval + this.#scrollIncr;
		const val2 = this.#formatValue( val );

		if ( this.#min - bound < val && val < this.#max + bound ) {
			this.#pxmoved += mov;
		}
		this.#updateVal( val2 );
		this.#oninput( val2 );
	}
	$onptrup( e ) {
		document.body.removeEventListener( "wheel", this.#onwheelBinded );
		this.$dispatch( "inputEnd", this.#value );
		this.#onchange();
	}
}

GSUdefineElement( "gsui-slider", gsuiSlider );
