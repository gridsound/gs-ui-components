"use strict";

class gsuiSlider extends HTMLElement {
	#min = 0;
	#max = 100;
	#scrollStep = 0;
	#scrollIncr = 0;
	#mousemoveSize = 0;
	#strokeWidth = 4;
	#previousval = "";
	#circ = false;
	#axeX = false;
	#ptrId = null;
	#connected = false;
	#onwheelBinded = this.#onwheel.bind( this );
	#pxval = 0;
	#pxmoved = 0;
	#svgLineLen = 0;
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiSlider" );
	#children = GSUI.$getTemplate( "gsui-slider" );
	#elements = GSUI.$findElements( this.#children, {
		input: ".gsuiSlider-input",
		line: ".gsuiSlider-line",
		lineColor: ".gsuiSlider-lineColor",
		svg: ".gsuiSlider-svg",
		svgLine: ".gsuiSlider-svgLine",
		svgLineColor: ".gsuiSlider-svgLineColor",
	} );
	static focused = null;

	constructor() {
		super();

		this.value = "";
		this.width =
		this.height = 0;
		Object.seal( this );

		this.onblur = this.#onblur.bind( this );
		this.onpointerdown = this.#onpointerdown.bind( this );
		this.onpointerleave = this.#onpointerleave.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			const brc = this.getBoundingClientRect();

			this.append( ...this.#children );
			this.width = brc.width;
			this.height = brc.height;
			this.#children = null;
			this.#connected = true;
			this.#setSVGcirc();
			this.#updateVal();
			GSUI.$setAttribute( this, "tabindex", "0" );
		}
	}
	static get observedAttributes() {
		return [ "value", "type", "min", "max", "step", "scroll-step", "mousemove-size", "stroke-width" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			let updateVal;

			switch ( prop ) {
				case "value":
					this.setValue( val );
					break;
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
					this.#elements.input.step = +val;
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
	}

	// .........................................................................
	setValue( val, bymouse ) {
		if ( !this.onpointermove || bymouse ) {
			const prevVal = this.#getInputVal();
			const newVal = ( this.#elements.input.value = val, this.#getInputVal() );

			if ( newVal !== prevVal ) {
				this.#updateVal();
				if ( bymouse ) {
					this.#dispatch( "input", +newVal );
				}
			}
			if ( !bymouse ) {
				this.#previousval = newVal;
			}
		}
	}

	// .........................................................................
	#setType( type ) {
		const st = this.#elements.lineColor.style;
		const circ = type === "circular";
		const axeX = type === "linear-x";

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
			const size = Math.min( this.width, this.height );
			const cx = size / 2;
			const r = ~~( ( size - this.#strokeWidth ) / 2 );

			GSUI.$setAttribute( this.#elements.svg, "viewBox", `0 0 ${ size } ${ size }` );
			GSUI.$setAttribute( this.#elements.svgLine, { r, cx, cy: cx, } );
			GSUI.$setAttribute( this.#elements.svgLineColor, { r, cx, cy: cx, } );
			this.#elements.svgLine.style.strokeWidth =
			this.#elements.svgLineColor.style.strokeWidth = this.#strokeWidth;
			this.#svgLineLen = r * 2 * Math.PI;
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
			const len = this.#getRange();
			const prcval = ( this.value - this.#min ) / len;
			const prcstart = -this.#min / len;
			const prclen = Math.abs( prcval - prcstart );
			const prcmin = Math.min( prcval, prcstart );

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
			GSUI.$setAttribute( this, "value", val );
			this.#dispatch( "change", +val );
			this.#previousval = val;
		}
	}

	// .........................................................................
	#onwheel( e ) {
		if ( this.#ptrId ) {
			const d = e.deltaY > 0 ? -1 : 1;
			const step = this.#scrollStep || this.#elements.input.step;

			this.#scrollIncr += step * d;
			this.setValue( +this.#getInputVal() + step * d, true );
			e.preventDefault();
			return false;
		}
	}
	#onpointerdown( e ) {
		if ( !GSUI.$hasAttribute( this, "disabled" ) ) {
			this.#pxval = this.#getRange() / this.#getMousemoveSize();
			this.#pxmoved = 0;
			this.#scrollIncr = 0;
			this.#ptrId = e.pointerId;
			this.setPointerCapture( e.pointerId );
			this.onpointermove = this.#onpointermove.bind( this );
			this.onpointerup = this.#onpointerup.bind( this );
			document.body.addEventListener( "wheel", this.#onwheelBinded, { passive: false } );
			this.focus();
			this.requestPointerLock();
			this.#dispatch( "inputStart", this.value );
		}
	}
	#onpointermove( e ) {
		const bound = this.#getRange() / 5;
		const mov = this.#circ || !this.#axeX ? -e.movementY : e.movementX;
		const val = +this.#previousval + ( this.#pxmoved + mov ) * this.#pxval + this.#scrollIncr;

		if ( this.#min - bound < val && val < this.#max + bound ) {
			this.#pxmoved += mov;
		}
		this.setValue( val, true );
	}
	#onpointerup() {
		document.exitPointerLock();
		if ( this.#ptrId ) {
			this.releasePointerCapture( this.#ptrId );
			this.#ptrId = null;
		}
		document.body.removeEventListener( "wheel", this.#onwheelBinded );
		this.onpointermove =
		this.onpointerup = null;
		this.#onchange();
		this.#dispatch( "inputEnd", this.value );
	}
	#onblur() {
		if ( this.onpointermove ) {
			this.#onpointerup();
		}
	}
	#onpointerleave() {
		this.#onchange();
	}
}

Object.seal( gsuiSlider );
customElements.define( "gsui-slider", gsuiSlider );
