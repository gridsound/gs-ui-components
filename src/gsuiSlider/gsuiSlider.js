"use strict";

function gsuiSlider() {
	var root = this._clone(),
		inp = root.querySelector( "input" );

	this.rootElement = root;
	this._elInput = inp;
	this._elThumb = root.querySelector( ".gsui-thumb" );
	this._elLine = root.querySelector( ".gsui-line" );
	this._elLineColor = root.querySelector( ".gsui-lineColor" );
	this._elSvg = root.querySelector( "svg" );
	this._elSvgBg = root.querySelector( ".gsui-svgBg" );
	this._elSvgThumb = root.querySelector( ".gsui-svgThumb" );
	this._elSvgLine = root.querySelector( ".gsui-svgLine" );
	this._elSvgLineColor = root.querySelector( ".gsui-svgLineColor" );
	root.onwheel = this._wheel.bind( this );
	root.onmousedown = this._mousedown.bind( this );
	this.options( { min: 0, max: 100, step: 1, value: 50, startFrom: 0 } );
	this.linear( "x" );
}

gsuiSlider.prototype = {
	linear: function( axe ) {
		this._circ = false;
		this._axeX = axe === "x";
		this.rootElement.classList.remove( "gsui-circular", "gsui-x", "gsui-y" );
		this.rootElement.classList.add( "gsui-linear", "gsui-" + axe );
		this._updateVal();
	},
	circular: function() {
		this._circ = true;
		this.rootElement.classList.remove( "gsui-linear", "gsui-x", "gsui-y" );
		this.rootElement.classList.add( "gsui-circular" );
		this._updateVal();
	},
	setValue: function( val, bymouse ) {
		var inp = this._elInput,
			prval = inp.value;

		inp.value = val;
		if ( inp.value !== prval ) {
			this._updateVal();
			if ( bymouse && this.oninput ) {
				this.oninput( inp.value );
			}
		}
	},
	options: function( obj ) {
		var k, inp = this._elInput;

		for( k in obj ) {
			this[ k ] = obj[ k ];
			if ( k !== "startFrom" ) {
				inp[ k ] = obj[ k ];
			}
		}
		this.startFrom = Math.max( inp.min, Math.min( this.startFrom, inp.max ) );
		this._updateVal();
	},
	resize: function( w, h ) {
		this.rootElement.style.width = w + "px";
		this.rootElement.style.height = h + "px";
		this._updateSize( w, h );
	},
	resized: function() {
		var rc = this.rootElement.getBoundingClientRect();

		this._updateSize( rc.width, rc.height );
	},

	// private:
	_clone: function() {
		var div = document.createElement( "div" );

		gsuiSlider.template = gsuiSlider.template || this._init();
		div.appendChild( document.importNode( gsuiSlider.template.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},
	_init: function() {
		document.body.addEventListener( "mousemove", function( e ) {
			gsuiSlider._sliderClicked && gsuiSlider._sliderClicked._mousemove( e );
		} );
		document.body.addEventListener( "mouseup", function( e ) {
			gsuiSlider._sliderClicked && gsuiSlider._sliderClicked._mouseup( e );
		} );
		return document.getElementById( "gsuiSlider" );
	},
	_updateVal: function() {
		var thumb, line,
			inp = this._elInput,
			inpval = +inp.value,
			inplen = inp.max - inp.min,
			prcval = ( inpval - inp.min ) / inplen,
			prcstart = ( this.startFrom - inp.min ) / inplen,
			prclen = Math.abs( prcval - prcstart ),
			prcmin = Math.min( prcval, prcstart );

		this.value = inpval;
		if ( this._circ ) {
			line = this._elSvgLineColor.style;
			line.strokeDasharray = prclen * this._svgLineLen + ", 999999";
			line.transform = "rotate(" + ( 90 + prcmin * 360 ) + "deg)";
		} else {
			thumb = this._elThumb.style;
			line = this._elLineColor.style;
			if ( this._axeX ) {
				thumb.left = prcval * 100 + "%";
				line.left = prcmin * 100 + "%";
				line.width = prclen * 100 + "%";
			} else {
				thumb.bottom = prcval * 100 + "%";
				line.bottom = prcmin * 100 + "%";
				line.height = prclen * 100 + "%";
			}
		}
	},
	_updateSize: function( w, h ) {
		if ( w !== this.width || h !== this.height ) {
			var thumbSize,
				thumb = this._elThumb.style,
				line = this._elLine.style,
				thick = this._axeX ? h : w,
				thick2 = thick / 2,
				lineThick = Math.ceil( thick / 10 ),
				sizemin = Math.min( w, h );

			lineThick % 2 !== thick % 2 && ++lineThick;
			thumbSize = thick - ~~thick2 - ~~thick2 % 2;
			thumb.marginLeft =
			thumb.marginBottom = thumbSize / -2 + "px";
			thumb.width = thumb.height = thumbSize + "px";
			if ( this._axeX ) {
				line.height = lineThick + "px";
				line.marginTop = lineThick / -2 + "px";
				line.left = line.right = thick2 + "px";
			} else {
				line.width = lineThick + "px";
				line.marginLeft = lineThick / -2 + "px";
				line.top = line.bottom = thick2 + "px";
			}
			this.width = w;
			this.height = h;
			this._svgLineLen = sizemin / 3;
			this._elSvg.setAttribute( "viewBox", "0 0 " + sizemin + " " + sizemin );
			this._elSvgBg.setAttribute( "r", sizemin / 2 );
			this._elSvgThumb.setAttribute( "r", sizemin / 3.2 );
			this._elSvgLine.setAttribute( "r", this._svgLineLen );
			this._elSvgLineColor.setAttribute( "r", this._svgLineLen );
			this._elSvgLine.style.strokeWidth =
			this._elSvgLineColor.style.strokeWidth = sizemin / 10;
			this._svgLineLen *= 2 * Math.PI;
		}
	},
	_wheel: function( e ) {
		var d = e.deltaY > 0 ? -1 : 1,
			inp = this._elInput;

		this.setValue( +inp.value + inp.step * ( this.axeX ? -d : d ), true );
	},
	_mousedown: function( e ) {
		var inp = this._elInput,
			bcr = this._elLine.getBoundingClientRect(),
			size = this._circ ? this._svgLineLen :
				this._axeX ? bcr.width : bcr.height;

		this._prval = inp.value;
		this._pxval = ( inp.max - inp.min ) / size;
		this._pxmoved = 0;
		gsuiSlider._sliderClicked = this;
		this.rootElement.requestPointerLock();
	},
	_mouseup: function( e ) {
		document.exitPointerLock();
		delete gsuiSlider._sliderClicked;
		if ( this._prval !== this._elInput.value ) {
			this.onchange && this.onchange( this._elInput.value );
		}
	},
	_mousemove: function( e ) {
		this._pxmoved += this._circ || !this._axeX ? -e.movementY : e.movementX;
		this.setValue( +this._prval + this._pxmoved * this._pxval, true );
	}
};
