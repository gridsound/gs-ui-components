"use strict";

class gsuiSlider {
	constructor() {
		const root = gsuiSlider.template.cloneNode( true );

		this.rootElement = root;
		this._elSvg = root.querySelector( "svg" );
		this._elLine = root.querySelector( ".gsui-line" );
		this._elInput = root.querySelector( "input" );
		this._elSvgLine = root.querySelector( ".gsui-svgLine" );
		this._elLineColor = root.querySelector( ".gsui-lineColor" );
		this._elSvgLineColor = root.querySelector( ".gsui-svgLineColor" );
		this._options = Object.seal( {
			value: 0, min: 0, max: 0, step: 0,
			type: "", scrollStep: 0, strokeWidth: 0, wheelChange: false,
		} );
		this.value =
		this._previousval = "";
		this.oninput =
		this.onchange =
		this.oninputend =
		this.oninputstart = null;
		this._circ =
		this._axeX =
		this._locked =
		this._attached = false;
		this.width =
		this.height =
		this._pxval =
		this._pxmoved =
		this._svgLineLen = 0;
		Object.seal( this );

		root._gsuiSlider_instance = this;
		root.onwheel = this._wheel.bind( this );
		root.onmouseup = this._mouseup.bind( this );
		root.onmousedown = this._mousedown.bind( this );
		root.onmousemove = this._mousemove.bind( this );
		root.onmouseleave = this._mouseleave.bind( this );
		this.options( {
			value: 50, min: 0, max: 100, step: 1,
			type: "linear-x", scrollStep: 1, strokeWidth: 4, wheelChange: true,
		} );
	}

	remove() {
		this._attached = false;
		this.rootElement.remove();
	}
	attached() {
		this._attached = true;
		this.resized();
	}
	options( obj ) {
		const inp = this._elInput,
			clazz = this.rootElement.classList,
			opt = Object.assign( this._options, obj );

		opt.step = Math.max( 0, opt.step ) || ( opt.max - opt.min ) / 10;
		opt.scrollStep = Math.max( opt.step, opt.scrollStep || opt.step );
		inp.min = opt.min;
		inp.max = opt.max;
		inp.step = opt.step;
		if ( "value" in obj ) {
			inp.value = opt.value;
		}
		this._previousval = this._getInputVal();
		if ( "type" in obj ) {
			this._circ = opt.type === "circular";
			this._axeX = opt.type === "linear-x";
			if ( this._circ ) {
				clazz.remove( "gsui-linear", "gsui-x", "gsui-y" );
				clazz.add( "gsui-circular" );
			} else {
				clazz.remove( "gsui-circular", "gsui-x", "gsui-y" );
				clazz.add( "gsui-linear", this._axeX ? "gsui-x" : "gsui-y" );
			}
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
	resized() {
		const rc = this.rootElement.getBoundingClientRect();

		this.resize( rc.width, rc.height );
	}
	resize( w, h ) {
		if ( w !== this.width || h !== this.height ) {
			this.width = w;
			this.height = h;
			this._setSVGcirc();
			this._updateVal();
		}
	}

	// private:
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
	_updateVal() {
		this.value = +this._getInputVal();
		if ( this._attached ) {
			const opt = this._options,
				len = opt.max - opt.min,
				prcval = ( this.value - opt.min ) / len,
				prcstart = -opt.min / len,
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
	_wheel( e ) {
		if ( this._options.wheelChange ) {
			const d = e.deltaY > 0 ? -1 : 1;

			this.setValue( +this._getInputVal() + this._options.scrollStep * d, true );
			return false;
		}
	}
	_mousedown() {
		const opt = this._options,
			bcr = this._elLine.getBoundingClientRect(),
			size = this._circ ? this._svgLineLen :
				this._axeX ? bcr.width : bcr.height;

		this._onchange();
		if ( this.oninputstart ) {
			this.oninputstart( this.value );
		}
		this._pxval = ( opt.max - opt.min ) / size;
		this._pxmoved = 0;
		this.rootElement.requestPointerLock();
	}
	_mousemove( e ) {
		if ( this._locked ) {
			const { min, max } = this._options,
				mov = this._circ || !this._axeX ? -e.movementY : e.movementX,
				bound = ( max - min ) / 5,
				val = +this._previousval + ( this._pxmoved + mov ) * this._pxval;

			if ( min - bound < val && val < max + bound ) {
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

gsuiSlider.template = document.querySelector( "#gsuiSlider-template" );
gsuiSlider.template.remove();
gsuiSlider.template.removeAttribute( "id" );

document.addEventListener( "pointerlockchange", () => {
	const el = document.pointerLockElement;

	if ( el ) {
		const slider = el._gsuiSlider_instance;

		if ( slider ) {
			slider._locked = true;
			gsuiSlider._focused = slider;
		}
	} else if ( gsuiSlider._focused ) {
		gsuiSlider._focused._mouseup();
	}
} );
