"use strict";

class gsuiSlider extends HTMLElement {
	#min = 0
	#max = 100
	#step = 1
	#scrollStep = 1
	#wheelChange = false
	#mousemoveSize = 0
	#strokeWidth = 4
	#previousval = ""
	#enable = true
	#circ = false
	#axeX = false
	#connected = false
	#pxval = 0
	#pxmoved = 0
	#svgLineLen = 0
	#children = GSUI.getTemplate( "gsui-slider" )
	#elInput = this.#children.shift()
	#elLine = null
	#elLineColor = null
	#elSvg = null
	#elSvgLine = null
	#elSvgLineColor = null

	constructor() {
		super();

		this.oninput =
		this.onchange =
		this.oninputend =
		this.oninputstart = null;
		this.value = "";
		this._locked = false;
		this.width =
		this.height = 0;
		this.#elLine = this.#children[ 0 ];
		this.#elLineColor = this.#elLine.firstElementChild;
		this.#elSvg = this.#children[ 1 ];
		this.#elSvgLine = this.#elSvg.firstElementChild;
		this.#elSvgLineColor = this.#elSvg.lastElementChild;
		Object.seal( this );

		this.onwheel = this.#onwheel.bind( this );
		this.onmouseup = this._mouseup.bind( this );
		this.onmousedown = this.#onmousedown.bind( this );
		this.onmousemove = this.#onmousemove.bind( this );
		this.onmouseleave = this.#onmouseleave.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		this.classList.add( "gsuiSlider" );
		if ( this.#children ) {
			const brc = this.getBoundingClientRect();

			this.append( ...this.#children );
			this.width = brc.width;
			this.height = brc.height;
			this.#children = null;
			this.#connected = true;
			this.#setSVGcirc();
			this.#updateVal();
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
					this.#setType( val );
					this.#setSVGcirc();
					updateVal = true;
					break;
				case "min":
					this.#elInput.min = this.#min = +val;
					updateVal = true;
					break;
				case "max":
					this.#elInput.max = this.#max = +val;
					updateVal = true;
					break;
				case "step":
					this.#elInput.step = this.#step = +val;
					updateVal = true;
					break;
				case "scroll-step":
					this.#scrollStep = +val;
					break;
				case "wheel-change":
					this.#wheelChange = typeof val === "string";
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
	}

	// .........................................................................
	setValue( val, bymouse ) {
		if ( !this._locked || bymouse ) {
			const prevVal = this.#getInputVal(),
				newVal = ( this.#elInput.value = val, this.#getInputVal() );

			if ( newVal !== prevVal ) {
				this.#updateVal();
				if ( bymouse && this.oninput ) {
					this.oninput( +newVal );
				}
			}
			if ( !bymouse ) {
				this.#previousval = newVal;
			}
		}
	}
	enable( b ) {
		this.#enable = b;
		this.classList.toggle( "gsuiSlider-disable", !b );
	}

	// .........................................................................
	#setType( type ) {
		const st = this.#elLineColor.style,
			circ = type === "circular",
			axeX = type === "linear-x";

		this.#circ = circ;
		this.#axeX = axeX;
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
	#setSVGcirc() {
		if ( this.#circ && this.width && this.height ) {
			const size = Math.min( this.width, this.height ),
				size2 = size / 2,
				circR = ~~( ( size - this.#strokeWidth ) / 2 );

			this.#elSvg.setAttribute( "viewBox", `0 0 ${ size } ${ size }` );
			this.#elSvgLine.setAttribute( "cx", size2 );
			this.#elSvgLine.setAttribute( "cy", size2 );
			this.#elSvgLine.setAttribute( "r", circR );
			this.#elSvgLineColor.setAttribute( "cx", size2 );
			this.#elSvgLineColor.setAttribute( "cy", size2 );
			this.#elSvgLineColor.setAttribute( "r", circR );
			this.#elSvgLine.style.strokeWidth =
			this.#elSvgLineColor.style.strokeWidth = this.#strokeWidth;
			this.#svgLineLen = circR * 2 * Math.PI;
		}
	}
	#getInputVal() {
		const val = this.#elInput.value;

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
					? this.#elLine.getBoundingClientRect().width
					: this.#elLine.getBoundingClientRect().height
		);
	}
	#updateVal() {
		this.value = +this.#getInputVal();
		if ( this.#connected ) {
			const len = this.#getRange(),
				prcval = ( this.value - this.#min ) / len,
				prcstart = -this.#min / len,
				prclen = Math.abs( prcval - prcstart ),
				prcmin = Math.min( prcval, prcstart );

			if ( this.#circ ) {
				const line = this.#elSvgLineColor.style;

				line.transform = `rotate(${ 90 + prcmin * 360 }deg)`;
				line.strokeDasharray = `${ prclen * this.#svgLineLen }, 999999`;
			} else {
				const line = this.#elLineColor.style;

				if ( this.#axeX ) {
					line.left = `${ prcmin * 100 }%`;
					line.width = `${ prclen * 100 }%`;
				} else {
					line.bottom = `${ prcmin * 100 }%`;
					line.height = `${ prclen * 100 }%`;
				}
			}
		}
	}
	#onchange() {
		const val = this.#getInputVal();

		if ( this.#previousval !== val ) {
			this.onchange && this.onchange( +val );
			this.#previousval = val;
		}
	}

	// .........................................................................
	#onwheel( e ) {
		if ( this.#enable && this.#wheelChange ) {
			const d = e.deltaY > 0 ? -1 : 1;

			this.setValue( +this.#getInputVal() + this.#scrollStep * d, true );
			return false;
		}
	}
	#onmousedown() {
		if ( this.#enable ) {
			this.#onchange();
			if ( this.oninputstart ) {
				this.oninputstart( this.value );
			}
			this.#pxval = this.#getRange() / this.#getMousemoveSize();
			this.#pxmoved = 0;
			this.requestPointerLock();
		}
	}
	#onmousemove( e ) {
		if ( this._locked ) {
			const bound = this.#getRange() / 5,
				mov = this.#circ || !this.#axeX ? -e.movementY : e.movementX,
				val = +this.#previousval + ( this.#pxmoved + mov ) * this.#pxval;

			if ( this.#min - bound < val && val < this.#max + bound ) {
				this.#pxmoved += mov;
			}
			this.setValue( val, true );
		}
	}
	_mouseup() {
		if ( this._locked ) {
			document.exitPointerLock();
			this._locked = false;
			this.#onchange();
			if ( this.oninputend ) {
				this.oninputend( this.value );
			}
		}
	}
	#onmouseleave() {
		this.#onchange();
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
