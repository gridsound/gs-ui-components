"use strict";

class gsuiSlider extends gsui0ne {
	#min = 0;
	#max = 100;
	#scrollStep = 0;
	#scrollIncr = 0;
	#mousemoveSize = 0;
	#strokeWidth = 4;
	#previousval = "";
	#previousValOninput = "";
	#oninputBind = this.#oninput.bind( this );
	#oninputThr = this.#oninputBind;
	#circ = false;
	#axeX = false;
	#onwheelBinded = this.#onwheel.bind( this );
	#pxval = 0;
	#pxmoved = 0;
	#svgLineLen = 0;

	constructor() {
		super( {
			$cmpName: "gsuiSlider",
			$tagName: "gsui-slider",
			$elements: {
				$input: ".gsuiSlider-input",
				$line: ".gsuiSlider-line",
				$lineColor: ".gsuiSlider-lineColor",
				$svg: ".gsuiSlider-svg",
				$svgLine: ".gsuiSlider-svgLine",
				$svgLineColor: ".gsuiSlider-svgLineColor",
			},
			$attributes: {
				tabindex: 0,
			},
			$ptrlock: true,
		} );
		this.value = "";
		this.width =
		this.height = 0;
		Object.seal( this );
	}

	// .........................................................................
	$firstTimeConnected() {
		const brc = this.getBoundingClientRect();

		this.width = brc.width;
		this.height = brc.height;
		this.#setSVGcirc();
		this.#updateVal();
	}
	$connected() {
		this.#updateVal();
	}
	static get observedAttributes() {
		return [ "value", "type", "min", "max", "step", "scroll-step", "throttle", "mousemove-size", "stroke-width" ];
	}
	$attributeChanged( prop, val ) {
		let updateVal;

		switch ( prop ) {
			case "value":
				this.$setValue( val );
				break;
			case "type":
				this.#setType( val );
				this.#setSVGcirc();
				updateVal = true;
				break;
			case "throttle":
				this.#oninputThr = val
					? GSUthrottle( this.#oninputBind, +val )
					: this.#oninputBind;
				break;
			case "min":
				this.$elements.$input.min = this.#min = +val;
				updateVal = true;
				break;
			case "max":
				this.$elements.$input.max = this.#max = +val;
				updateVal = true;
				break;
			case "step":
				this.$elements.$input.step = +val;
				updateVal = true;
				break;
			case "scroll-step":
				this.#scrollStep = +val;
				break;
			case "mousemove-size":
				this.#mousemoveSize = +val;
				break;
			case "stroke-width":
				this.#strokeWidth = +val;
				this.#setSVGcirc();
				break;
		}
		if ( updateVal ) {
			this.#previousval = this.#getInputVal();
			this.#updateVal();
		}
	}

	// .........................................................................
	$setValue( val, bymouse ) {
		if ( !this.$isActive || bymouse ) {
			const prevVal = this.#getInputVal();
			const newVal = ( this.$elements.$input.value = val, this.#getInputVal() );

			if ( newVal !== prevVal ) {
				this.#updateVal();
				if ( bymouse ) {
					this.#oninputThr( newVal );
				}
			}
			if ( !bymouse ) {
				this.#previousval = newVal;
			}
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
		if ( this.#circ && this.width && this.height ) {
			const size = Math.min( this.width, this.height );
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
	#getInputVal() {
		const val = this.$elements.$input.value;

		return Math.abs( +val ) < .000001 ? "0" : val;
	}
	#getRange() {
		return this.#max - this.#min;
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
	#updateVal() {
		this.value = +this.#getInputVal();
		if ( this.$isConnected ) {
			const len = this.#getRange();
			const prcval = ( this.value - this.#min ) / len;
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
		const val = this.#getInputVal();

		if ( this.#previousval !== val ) {
			GSUsetAttribute( this, "value", val );
			this.#previousval = val;
			this.$dispatch( "change", +val );
		}
	}
	#oninput( val ) {
		if ( val !== this.#previousValOninput ) {
			this.#previousValOninput = val;
			this.$dispatch( "input", +val );
		}
	}

	// .........................................................................
	#onwheel( e ) {
		if ( this.$isActive ) {
			const d = e.deltaY > 0 ? -1 : 1;
			const step = this.#scrollStep || this.$elements.$input.step;

			this.#scrollIncr += step * d;
			this.$setValue( +this.#getInputVal() + step * d, true );
			e.preventDefault();
			return false;
		}
	}
	$onptrdown( e ) {
		if ( e.button !== 0 || GSUhasAttribute( this, "disabled" ) ) {
			return false;
		}
		this.#pxval = this.#getRange() / this.#getMousemoveSize();
		this.#pxmoved = 0;
		this.#scrollIncr = 0;
		document.body.addEventListener( "wheel", this.#onwheelBinded, { passive: false } );
		this.focus();
		this.$dispatch( "inputStart", this.value );
	}
	$onptrmove( e ) {
		const bound = this.#getRange() / 5;
		const mov = this.#circ || !this.#axeX ? -e.movementY : e.movementX;
		const val = +this.#previousval + ( this.#pxmoved + mov ) * this.#pxval + this.#scrollIncr;

		if ( this.#min - bound < val && val < this.#max + bound ) {
			this.#pxmoved += mov;
		}
		this.$setValue( val, true );
	}
	$onptrup( e ) {
		document.body.removeEventListener( "wheel", this.#onwheelBinded );
		this.#onchange();
		this.$dispatch( "inputEnd", this.value );
	}
}

GSUdefineElement( "gsui-slider", gsuiSlider );
