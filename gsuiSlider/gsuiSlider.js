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
	#locked = false
	#connected = false
	#pxval = 0
	#pxmoved = 0
	#svgLineLen = 0
	#children = GSUI.getTemplate( "gsui-slider" )
	#elements = GSUI.findElements( this.#children, {
		input: ".gsuiSlider-input",
		line: ".gsuiSlider-line",
		lineColor: ".gsuiSlider-lineColor",
		svg: ".gsuiSlider-svg",
		svgLine: ".gsuiSlider-svgLine",
		svgLineColor: ".gsuiSlider-svgLineColor",
	} )
	static focused = null

	constructor() {
		super();

		this.oninput =
		this.onchange =
		this.oninputend =
		this.oninputstart = null;
		this.value = "";
		this.width =
		this.height = 0;
		Object.seal( this );

		this.onwheel = this.#onwheel.bind( this );
		this.onmouseup = this.#onmouseup.bind( this );
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
					this.#elements.input.min = this.#min = +val;
					updateVal = true;
					break;
				case "max":
					this.#elements.input.max = this.#max = +val;
					updateVal = true;
					break;
				case "step":
					this.#elements.input.step = this.#step = +val;
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
	static pointerLockChange() {
		const el = document.pointerLockElement;

		if ( el ) {
			if ( el.classList.contains( "gsuiSlider" ) ) {
				el.#locked = true;
				gsuiSlider.focused = el;
			}
		} else if ( gsuiSlider.focused ) {
			gsuiSlider.focused.#onmouseup();
		}
	}
	setValue( val, bymouse ) {
		if ( !this.#locked || bymouse ) {
			const prevVal = this.#getInputVal(),
				newVal = ( this.#elements.input.value = val, this.#getInputVal() );

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
		const st = this.#elements.lineColor.style,
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

			this.#elements.svg.setAttribute( "viewBox", `0 0 ${ size } ${ size }` );
			this.#elements.svgLine.setAttribute( "cx", size2 );
			this.#elements.svgLine.setAttribute( "cy", size2 );
			this.#elements.svgLine.setAttribute( "r", circR );
			this.#elements.svgLineColor.setAttribute( "cx", size2 );
			this.#elements.svgLineColor.setAttribute( "cy", size2 );
			this.#elements.svgLineColor.setAttribute( "r", circR );
			this.#elements.svgLine.style.strokeWidth =
			this.#elements.svgLineColor.style.strokeWidth = this.#strokeWidth;
			this.#svgLineLen = circR * 2 * Math.PI;
		}
	}
	#getInputVal() {
		const val = this.#elements.input.value;

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
					? this.#elements.line.getBoundingClientRect().width
					: this.#elements.line.getBoundingClientRect().height
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
				const line = this.#elements.svgLineColor.style;

				line.transform = `rotate(${ 90 + prcmin * 360 }deg)`;
				line.strokeDasharray = `${ prclen * this.#svgLineLen }, 999999`;
			} else {
				const line = this.#elements.lineColor.style;

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
		if ( this.#locked ) {
			const bound = this.#getRange() / 5,
				mov = this.#circ || !this.#axeX ? -e.movementY : e.movementX,
				val = +this.#previousval + ( this.#pxmoved + mov ) * this.#pxval;

			if ( this.#min - bound < val && val < this.#max + bound ) {
				this.#pxmoved += mov;
			}
			this.setValue( val, true );
		}
	}
	#onmouseup() {
		if ( this.#locked ) {
			document.exitPointerLock();
			this.#locked = false;
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

Object.seal( gsuiSlider );

document.addEventListener( "pointerlockchange", gsuiSlider.pointerLockChange );
