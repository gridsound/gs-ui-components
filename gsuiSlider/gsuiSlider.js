"use strict";

function gsuiSlider() {
	var root = this._clone();

	this.rootElement = root;
	this._elInput = root.querySelector( "input" );
	this._elLine = root.querySelector( ".gsui-line" );
	this._elLineColor = root.querySelector( ".gsui-lineColor" );
	this._elSvg = root.querySelector( "svg" );
	this._elSvgLine = root.querySelector( ".gsui-svgLine" );
	this._elSvgLineColor = root.querySelector( ".gsui-svgLineColor" );
	root.onwheel = this._wheel.bind( this );
	root.onmousedown = this._mousedown.bind( this );
	root.onmouseleave = this._mouseleave.bind( this );
}

gsuiSlider.prototype = {
	options( obj ) {
		var inp = this._elInput,
			clazz = this.rootElement.classList;

		this._circ = obj.type === "circular";
		this._axeX = obj.type === "linear-x";
		this._options = obj = Object.assign( {}, obj );
		obj.step = Math.max( 0, obj.step ) || ( obj.max - obj.min ) / 10;
		obj.scrollStep = Math.max( obj.step, obj.scrollStep || obj.step );
		obj.startFrom = Math.max( obj.min, Math.min( obj.startFrom || 0, obj.max ) );
		inp.min = obj.min;
		inp.max = obj.max;
		inp.step = obj.step;
		inp.value = obj.value;
		this._previousval = inp.value;
		if ( this._circ ) {
			clazz.remove( "gsui-linear", "gsui-x", "gsui-y" );
			clazz.add( "gsui-circular" );
		} else {
			clazz.remove( "gsui-circular", "gsui-x", "gsui-y" );
			clazz.add( "gsui-linear", this._axeX ? "gsui-x" : "gsui-y" );
		}
		this._updateVal();
	},
	setValue( val, bymouse ) {
		var inp = this._elInput,
			prval = inp.value;

		inp.value = val;
		if ( inp.value !== prval ) {
			this._updateVal();
			if ( bymouse && this.oninput ) {
				this.oninput( +inp.value );
			}
		}
		if ( !bymouse ) {
			this._previousval = inp.value;
		}
	},
	resized() {
		var rc = this.rootElement.getBoundingClientRect();

		this.resize( rc.width, rc.height );
	},
	resize( w, h ) {
		this.rootElement.style.width = w + "px";
		this.rootElement.style.height = h + "px";
		if ( w !== this.width || h !== this.height ) {
			var thick = this._axeX ? h : w,
				size = Math.min( w, h ),
				size2 = size / 2,
				strokeW = ~~( size / 10 ),
				circR = ~~( ( size - strokeW ) / 2 );

			this.width = w;
			this.height = h;
			if ( this._circ ) {
				this._elSvg.setAttribute( "viewBox", "0 0 " + size + " " + size );
				this._elSvgLine.setAttribute( "cx", size2 );
				this._elSvgLine.setAttribute( "cy", size2 );
				this._elSvgLine.setAttribute( "r", circR );
				this._elSvgLineColor.setAttribute( "cx", size2 );
				this._elSvgLineColor.setAttribute( "cy", size2 );
				this._elSvgLineColor.setAttribute( "r", circR );
				this._elSvgLine.style.strokeWidth =
				this._elSvgLineColor.style.strokeWidth = strokeW;
				this._svgLineLen = circR * 2 * Math.PI;
			}
			this._updateVal();
		}
	},

	// private:
	_clone() {
		var div = document.createElement( "div" );

		gsuiSlider.template = gsuiSlider.template || this._init();
		div.appendChild( document.importNode( gsuiSlider.template.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},
	_init() {
		document.body.addEventListener( "mousemove", function( e ) {
			gsuiSlider._focused && gsuiSlider._focused._mousemove( e );
		} );
		document.body.addEventListener( "mouseup", function( e ) {
			gsuiSlider._focused && gsuiSlider._focused._mouseup( e );
		} );
		return document.getElementById( "gsuiSlider" );
	},
	_updateVal() {
		this.value = +this._elInput.value;
		if ( this.rootElement.parentNode ) {
			var line,
				opt = this._options,
				inplen = opt.max - opt.min,
				prcval = ( this.value - opt.min ) / inplen,
				prcstart = ( opt.startFrom - opt.min ) / inplen,
				prclen = Math.abs( prcval - prcstart ),
				prcmin = Math.min( prcval, prcstart );

			if ( this._circ ) {
				line = this._elSvgLineColor.style;
				line.strokeDasharray = prclen * this._svgLineLen + ", 999999";
				line.transform = "rotate(" + ( 90 + prcmin * 360 ) + "deg)";
			} else {
				line = this._elLineColor.style;
				if ( this._axeX ) {
					line.left = prcmin * 100 + "%";
					line.width = prclen * 100 + "%";
				} else {
					line.bottom = prcmin * 100 + "%";
					line.height = prclen * 100 + "%";
				}
			}
		}
	},
	_onchange() {
		var val = this._elInput.value;

		if ( this._previousval !== val ) {
			this.onchange && this.onchange( +val );
			this._previousval = val;
		}
	},

	// events:
	_wheel( e ) {
		var d = e.deltaY > 0 ? -1 : 1;

		this.setValue( +this._elInput.value + this._options.scrollStep * d, true );
		return false;
	},
	_mousedown( e ) {
		var opt = this._options,
			bcr = this._elLine.getBoundingClientRect(),
			size = this._circ ? this._svgLineLen :
				this._axeX ? bcr.width : bcr.height;

		this._onchange();
		this._pxval = ( opt.max - opt.min ) / size;
		this._pxmoved = 0;
		gsuiSlider._focused = this;
		this.rootElement.requestPointerLock();
	},
	_mouseup( e ) {
		document.exitPointerLock();
		delete gsuiSlider._focused;
		this._onchange();
	},
	_mousemove( e ) {
		var opt = this._options,
			mov = this._circ || !this._axeX ? -e.movementY : e.movementX,
			bound = ( opt.max - opt.min ) / 5,
			val = +this._previousval + ( this._pxmoved + mov ) * this._pxval;

		if ( opt.min - bound < val && val < opt.max + bound ) {
			this._pxmoved += mov;
		}
		this.setValue( val, true );
	},
	_mouseleave() {
		this._onchange();
	}
};
