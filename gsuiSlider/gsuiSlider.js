"use strict";

class gsuiSlider extends HTMLElement {
	constructor() {
		const [ input, ...html ] = GSUI.getTemplate( "gsui-slider" );

		super();
		this._min = 0;
		this._max = 100;
		this._step = 1;
		this._scrollStep = 1;
		this._wheelChange = false;
		this._mousemoveSize = 0;
		this._strokeWidth = 4;

		this.oninput =
		this.onchange =
		this.oninputend =
		this.oninputstart = null;

		this.value =
		this._previousval = "";
		this._enable = true;
		this._circ =
		this._axeX =
		this._locked =
		this._connected = false;
		this.width =
		this.height =
		this._pxval =
		this._pxmoved =
		this._svgLineLen = 0;
		this._children = html;
		this._elInput = input;
		this._elLine = html[ 0 ];
		this._elLineColor = this._elLine.firstElementChild;
		this._elSvg = html[ 1 ];
		this._elSvgLine = this._elSvg.firstElementChild;
		this._elSvgLineColor = this._elSvg.lastElementChild;
		Object.seal( this );

		this.onwheel = this._wheel.bind( this );
		this.onmouseup = this._mouseup.bind( this );
		this.onmousedown = this._mousedown.bind( this );
		this.onmousemove = this._mousemove.bind( this );
		this.onmouseleave = this._mouseleave.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		this.classList.add( "gsuiSlider" );
		if ( this._children ) {
			const brc = this.getBoundingClientRect();

			this.append( ...this._children );
			this.width = brc.width;
			this.height = brc.height;
			this._children = null;
			this._connected = true;
			this._setSVGcirc();
			this._updateVal();
		}
	}
	static get observedAttributes() {
		return [ "type", "min", "max", "step", "scroll-step", "wheel-change", "mousemove-size", "stroke-width" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			let updateVal;

			switch ( prop ) {
				case "type":
					this._setType( val );
					this._setSVGcirc();
					updateVal = true;
					break;
				case "min":
					this._elInput.min = this._min = +val;
					updateVal = true;
					break;
				case "max":
					this._elInput.max = this._max = +val;
					updateVal = true;
					break;
				case "step":
					this._elInput.step = this._step = +val;
					updateVal = true;
					break;
				case "scroll-step":
					this._scrollStep = +val;
					break;
				case "wheel-change":
					this._wheelChange = typeof val === "string";
					break;
				case "mousemove-size":
					this._mousemoveSize = +val;
					break;
				case "stroke-width":
					this._strokeWidth = +val;
					this._setSVGcirc();
					break;
			}
			if ( updateVal ) {
				this._previousval = this._getInputVal();
				this._updateVal();
			}
		}
	}

	// .........................................................................
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
				circR = ~~( ( size - this._strokeWidth ) / 2 );

			this._elSvg.setAttribute( "viewBox", `0 0 ${ size } ${ size }` );
			this._elSvgLine.setAttribute( "cx", size2 );
			this._elSvgLine.setAttribute( "cy", size2 );
			this._elSvgLine.setAttribute( "r", circR );
			this._elSvgLineColor.setAttribute( "cx", size2 );
			this._elSvgLineColor.setAttribute( "cy", size2 );
			this._elSvgLineColor.setAttribute( "r", circR );
			this._elSvgLine.style.strokeWidth =
			this._elSvgLineColor.style.strokeWidth = this._strokeWidth;
			this._svgLineLen = circR * 2 * Math.PI;
		}
	}
	_getInputVal() {
		const val = this._elInput.value;

		return Math.abs( +val ) < .000001 ? "0" : val;
	}
	_getRange() {
		return this._max - this._min;
	}
	_getMousemoveSize() {
		return this._mousemoveSize || (
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
				prcval = ( this.value - this._min ) / len,
				prcstart = -this._min / len,
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
		if ( this._enable && this._wheelChange ) {
			const d = e.deltaY > 0 ? -1 : 1;

			this.setValue( +this._getInputVal() + this._scrollStep * d, true );
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

			if ( this._min - bound < val && val < this._max + bound ) {
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
