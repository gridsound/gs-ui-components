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
		GSUdomSetAttr( this, "tabindex", "0" );
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
		if ( !circ ) {
			GSUdomStyle( this.$elements.$lineColor, {
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

			GSUdomViewBox( this.$elements.$svg, size, size );
			GSUdomSetAttr( this.$elements.$svgLine, { r, cx, cy: cx, } );
			GSUdomSetAttr( this.$elements.$svgLineColor, { r, cx, cy: cx, } );
			this.$elements.$svgLine.style.strokeWidth =
			this.$elements.$svgLineColor.style.strokeWidth = this.#strokeWidth;
			this.#svgLineLen = r * 2 * Math.PI;
		}
	}
	#getRange() {
		return this.#max - this.#min;
	}
	#formatValue( val ) {
		return GSUmathRound( GSUmathClamp( val, this.#min, this.#max ), this.#step );
	}
	#getMousemoveSize() {
		return this.#mousemoveSize || (
			this.#circ
				? this.#svgLineLen
				: GSUdomBCRwh( this.$elements.$line )[ +!this.#axeX ]
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
				GSUdomStyle( this.$elements.$svgLineColor, {
					rotate: `${ 90 + prcmin * 360 }deg`,
					strokeDasharray: `${ prclen * this.#svgLineLen }, 999999`,
				} );
			} else {
				GSUdomStyle( this.$elements.$lineColor, this.#axeX
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
		this.#valueSave = this.#value;
		GSUdomSetAttr( this, "value", this.#value );
		GSUdomDispatch( this, GSEV_SLIDER_CHANGE, this.#value );
	}
	#oninput( val ) {
		if ( val !== this.#value ) {
			this.#value = val;
			GSUdomDispatch( this, GSEV_SLIDER_INPUT, +val );
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
		if ( GSUdomHasAttr( this, "disabled" ) ) {
			return false;
		}
		switch ( e.button ) {
			default: return false;
			case 1: {
				const def = GSUdomHasAttr( this, "defaultValue" ) && GSUdomGetAttrNum( this, "defaultValue" );

				if ( def !== false && this.#value !== def ) {
					this.#value = def;
					this.#onchange();
				}
				e.preventDefault();
				GSUdomFocus( this );
				return false;
			}
			case 0:
				this.#valueSave = this.#value;
				this.#pxval = this.#getRange() / this.#getMousemoveSize();
				this.#pxmoved = 0;
				this.#scrollIncr = 0;
				GSUdomBody.addEventListener( "wheel", this.#onwheelBinded, { passive: false } );
				GSUdomDispatch( this, GSEV_SLIDER_INPUTSTART, this.#value );
				break;
		}
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
		GSUdomBody.removeEventListener( "wheel", this.#onwheelBinded );
		GSUdomDispatch( this, GSEV_SLIDER_INPUTEND, this.#value );
		if ( this.#value !== this.#valueSave ) {
			this.#onchange();
		}
	}
}

GSUdomDefine( "gsui-slider", gsuiSlider );
