"use strict";

class gsuiSlider extends HTMLElement {
	constructor() {
		super();
		this.className = "gsuiSlider";
		this.append(
			this._elInput = GSUI.createElement( "input", { type: "range", class: "gsuiSlider-input" } ),
			this._elLine = GSUI.createElement( "div", { class: "gsuiSlider-line" },
				this._elLineColor = GSUI.createElement( "div", { class: "gsuiSlider-lineColor" } ),
			),
			this._elSvg = GSUI.createElementNS( "svg", { class: "gsuiSlider-svg" },
				this._elSvgLine = GSUI.createElementNS( "circle", { class: "gsuiSlider-svgLine" } ),
				this._elSvgLineColor = GSUI.createElementNS( "circle", { class: "gsuiSlider-svgLineColor" } ),
			),
			GSUI.createElement( "div", { class: "gsuiSlider-eventCatcher" } ),
		);
		this._options = Object.seal( {
			value: 0, min: 0, max: 0, step: 0, mousemoveSize: 0,
			type: "", scrollStep: 0, strokeWidth: 0, wheelChange: false,
		} );
		this.value =
		this._previousval = "";
		this._enable = true;
		this.oninput =
		this.onchange =
		this.oninputend =
		this.oninputstart = null;
		this._circ =
		this._axeX =
		this._locked =
		this._connected = false;
		this.width =
		this.height =
		this._pxval =
		this._pxmoved =
		this._svgLineLen = 0;
		Object.seal( this );

		this.onwheel = this._wheel.bind( this );
		this.onmouseup = this._mouseup.bind( this );
		this.onmousedown = this._mousedown.bind( this );
		this.onmousemove = this._mousemove.bind( this );
		this.onmouseleave = this._mouseleave.bind( this );
		this.options( {
			value: 0, min: 0, max: 100, step: 1,
			type: "linear-x", scrollStep: 1, strokeWidth: 4, wheelChange: false,
		} );
	}

	connectedCallback() {
		const brc = this.getBoundingClientRect();

		this._connected = true;
		if ( brc.width !== this.width || brc.height !== this.height ) {
			this.width = brc.width;
			this.height = brc.height;
			this._setSVGcirc();
			this._updateVal();
		}
	}

	options( obj ) {
		const inp = this._elInput,
			opt = Object.assign( this._options, obj );

		opt.step = Math.max( 0, opt.step ) || this._getRange() / 10;
		opt.scrollStep = Math.max( opt.step, opt.scrollStep || opt.step );
		inp.min = opt.min;
		inp.max = opt.max;
		inp.step = opt.step;
		if ( "value" in obj ) {
			inp.value = opt.value;
		}
		this._previousval = this._getInputVal();
		if ( "type" in obj ) {
			this._setType( obj.type );
		}
		if ( "type" in obj || "strokeWidth" in obj ) {
			this._setSVGcirc();
		}
		this._updateVal();
	}
	setValue( val, bymouse ) {
		if ( !this._locked || bymouse ) {
			const prevVal = this._getInputVal(),
				newVal = ( this._elInput.value = val, this._getInputVal() );

			if ( newVal !== prevVal ) {
				this._updateVal();
				if ( bymouse && this.oninput ) {
					this.oninput( +newVal );
				}
			}
			if ( !bymouse ) {
				this._previousval = newVal;
			}
		}
	}
	enable( b ) {
		this._enable = b;
		this.classList.toggle( "gsuiSlider-disable", !b );
	}

	// private:
	// .........................................................................
	_setType( type ) {
		const st = this._elLineColor.style,
			circ = type === "circular",
			axeX = type === "linear-x";

		this._circ = circ;
		this._axeX = axeX;
		this.classList.toggle( "gsuiSlider-circular", circ );
		this.classList.toggle( "gsuiSlider-linear", !circ );
		if ( !circ ) {
			if ( axeX ) {
				st.left =
				st.width = "";
				st.top = "0";
				st.height = "100%";
			} else {
				st.top =
				st.height = "";
				st.left = "0";
				st.width = "100%";
			}
		}
	}
	_setSVGcirc() {
		if ( this._circ && this.width && this.height ) {
			const size = Math.min( this.width, this.height ),
				size2 = size / 2,
				stroW = this._options.strokeWidth,
				circR = ~~( ( size - stroW ) / 2 );

			this._elSvg.setAttribute( "viewBox", `0 0 ${ size } ${ size }` );
			this._elSvgLine.setAttribute( "cx", size2 );
			this._elSvgLine.setAttribute( "cy", size2 );
			this._elSvgLine.setAttribute( "r", circR );
			this._elSvgLineColor.setAttribute( "cx", size2 );
			this._elSvgLineColor.setAttribute( "cy", size2 );
			this._elSvgLineColor.setAttribute( "r", circR );
			this._elSvgLine.style.strokeWidth =
			this._elSvgLineColor.style.strokeWidth = stroW;
			this._svgLineLen = circR * 2 * Math.PI;
		}
	}
	_getInputVal() {
		const val = this._elInput.value;

		return Math.abs( +val ) < .000001 ? "0" : val;
	}
	_getRange() {
		return this._options.max - this._options.min;
	}
	_getMousemoveSize() {
		return this._options.mousemoveSize || (
			this._circ
				? this._svgLineLen
				: this._axeX
					? this._elLine.getBoundingClientRect().width
					: this._elLine.getBoundingClientRect().height
		);
	}
	_updateVal() {
		this.value = +this._getInputVal();
		if ( this._connected ) {
			const len = this._getRange(),
				prcval = ( this.value - this._options.min ) / len,
				prcstart = -this._options.min / len,
				prclen = Math.abs( prcval - prcstart ),
				prcmin = Math.min( prcval, prcstart );

			if ( this._circ ) {
				const line = this._elSvgLineColor.style;

				line.transform = `rotate(${ 90 + prcmin * 360 }deg)`;
				line.strokeDasharray = `${ prclen * this._svgLineLen }, 999999`;
			} else {
				const line = this._elLineColor.style;

				if ( this._axeX ) {
					line.left = `${ prcmin * 100 }%`;
					line.width = `${ prclen * 100 }%`;
				} else {
					line.bottom = `${ prcmin * 100 }%`;
					line.height = `${ prclen * 100 }%`;
				}
			}
		}
	}
	_onchange() {
		const val = this._getInputVal();

		if ( this._previousval !== val ) {
			this.onchange && this.onchange( +val );
			this._previousval = val;
		}
	}

	// events:
	// .........................................................................
	_wheel( e ) {
		if ( this._enable && this._options.wheelChange ) {
			const d = e.deltaY > 0 ? -1 : 1;

			this.setValue( +this._getInputVal() + this._options.scrollStep * d, true );
			return false;
		}
	}
	_mousedown() {
		if ( this._enable ) {
			this._onchange();
			if ( this.oninputstart ) {
				this.oninputstart( this.value );
			}
			this._pxval = this._getRange() / this._getMousemoveSize();
			this._pxmoved = 0;
			this.requestPointerLock();
		}
	}
	_mousemove( e ) {
		if ( this._locked ) {
			const bound = this._getRange() / 5,
				mov = this._circ || !this._axeX ? -e.movementY : e.movementX,
				val = +this._previousval + ( this._pxmoved + mov ) * this._pxval;

			if ( this._options.min - bound < val && val < this._options.max + bound ) {
				this._pxmoved += mov;
			}
			this.setValue( val, true );
		}
	}
	_mouseup() {
		if ( this._locked ) {
			document.exitPointerLock();
			this._locked = false;
			this._onchange();
			if ( this.oninputend ) {
				this.oninputend( this.value );
			}
		}
	}
	_mouseleave() {
		this._onchange();
	}
}

customElements.define( "gsui-slider", gsuiSlider );

document.addEventListener( "pointerlockchange", () => {
	const el = document.pointerLockElement;

	if ( el ) {
		if ( el.classList.contains( "gsuiSlider" ) ) {
			el._locked = true;
			gsuiSlider._focused = el;
		}
	} else if ( gsuiSlider._focused ) {
		gsuiSlider._focused._mouseup();
	}
} );
