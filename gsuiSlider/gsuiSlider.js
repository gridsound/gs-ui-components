"use strict";

function gsuiSlider() {
	var root = this._clone(),
		inp = root.querySelector( "input" );

	this.rootElement = root;
	this._elInput = inp;
	this._elLine = root.querySelector( ".gsui-line" );
	this._elLineColor = root.querySelector( ".gsui-lineColor" );
	this._elSvg = root.querySelector( "svg" );
	this._elSvgLine = root.querySelector( ".gsui-svgLine" );
	this._elSvgLineColor = root.querySelector( ".gsui-svgLineColor" );
	root.onwheel = this._wheel.bind( this );
	root.onmousedown = this._mousedown.bind( this );
	this.options( {
		min: 0,
		max: 100,
		step: 1,
		scrollStep: 5,
		value: 50,
		startFrom: 0
	} );
	this.linear( "x" );
}

gsuiSlider.prototype = {
	linear( axe ) {
		this._circ = false;
		this._axeX = axe === "x";
		this.rootElement.classList.remove( "gsui-circular", "gsui-x", "gsui-y" );
		this.rootElement.classList.add( "gsui-linear", "gsui-" + axe );
		this._updateVal();
	},
	circular() {
		this._circ = true;
		this.rootElement.classList.remove( "gsui-linear", "gsui-x", "gsui-y" );
		this.rootElement.classList.add( "gsui-circular" );
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
	},
	options( obj ) {
		var k, inp = this._elInput;

		this._options = obj = Object.assign( {}, obj );
		obj.step = Math.max( 0, obj.step ) || ( obj.max - obj.min ) / 10;
		obj.scrollStep = Math.max( obj.step, obj.scrollStep || obj.step );
		obj.startFrom = Math.max( obj.min, Math.min( obj.startFrom, obj.max ) );
		for( k in obj ) {
			obj[ k ] = +obj[ k ];
			if ( k !== "startFrom" ) {
				inp[ k ] = obj[ k ];
			}
		}
		this._updateVal();
	},
	resize( w, h ) {
		this.rootElement.style.width = w + "px";
		this.rootElement.style.height = h + "px";
		this._updateSize( w, h );
	},
	resized() {
		var rc = this.rootElement.getBoundingClientRect();

		this._updateSize( rc.width, rc.height );
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
		var line,
			opt = this._options,
			inpval = +this._elInput.value,
			inplen = opt.max - opt.min,
			prcval = ( inpval - opt.min ) / inplen,
			prcstart = ( opt.startFrom - opt.min ) / inplen,
			prclen = Math.abs( prcval - prcstart ),
			prcmin = Math.min( prcval, prcstart );

		this.value = inpval;
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
	},
	_updateSize( w, h ) {
		if ( w !== this.width || h !== this.height ) {
			var thick = this._axeX ? h : w,
				sizemin = Math.min( w, h ),
				strokeW = ~~( sizemin / 10 ),
				circR = ~~( ( sizemin - strokeW ) / 2 );

			this.width = w;
			this.height = h;
			this._elSvg.setAttribute( "viewBox", "0 0 " + sizemin + " " + sizemin );
			this._elSvgLine.setAttribute( "r", circR );
			this._elSvgLineColor.setAttribute( "r", circR );
			this._elSvgLine.style.strokeWidth =
			this._elSvgLineColor.style.strokeWidth = strokeW;
			this._svgLineLen = circR * 2 * Math.PI;
		}
	},
	_wheel( e ) {
		var d = e.deltaY > 0 ? -1 : 1;

		this.setValue( +this._elInput.value + this._options.scrollStep * d, true );
	},
	_mousedown( e ) {
		var opt = this._options,
			bcr = this._elLine.getBoundingClientRect(),
			size = this._circ ? this._svgLineLen :
				this._axeX ? bcr.width : bcr.height;

		this._prval = this._elInput.value;
		this._pxval = ( opt.max - opt.min ) / size;
		this._pxmoved = 0;
		gsuiSlider._focused = this;
		this.rootElement.requestPointerLock();
	},
	_mouseup( e ) {
		document.exitPointerLock();
		delete gsuiSlider._focused;
		if ( this._prval !== this._elInput.value ) {
			this.onchange && this.onchange( +this._elInput.value );
		}
	},
	_mousemove( e ) {
		var opt = this._options,
			mov = this._circ || !this._axeX ? -e.movementY : e.movementX,
			bound = ( opt.max - opt.min ) / 5,
			val = +this._prval + ( this._pxmoved + mov ) * this._pxval;

		if ( opt.min - bound < val && val < opt.max + bound ) {
			this._pxmoved += mov;
		}
		this.setValue( val, true );
	}
};
