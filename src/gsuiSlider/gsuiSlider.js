"use strict";

function gsuiSlider() {
	var root = this._clone(),
		inp = root.querySelector( "input" );

	this.rootElement = root;
	this._elInput = inp;
	this._elThumb = root.querySelector( ".gsui-thumb" );
	this._elLine = root.querySelector( ".gsui-line" );
	this._elLineColor = root.querySelector( ".gsui-lineColor" );
	root.onwheel = this._wheel.bind( this );
	root.onmousedown = this._mousedown.bind( this );
	this.options( { min: 0, max: 100,
		step: 1, value: 50, startFrom: 0 } );
}

gsuiSlider.prototype = {
	axe: function( axe ) {
		( this._axeX = axe === "x" )
			? this._elLineColor.style.top = 0
			: this._elLineColor.style.left = 0;
		this.rootElement.classList.remove( "gsui-x", "gsui-y" );
		this.rootElement.classList.add( "gsui-" + axe );
	},
	setValue: function( val ) {
		var prval = this._elInput.value;

		this._elInput.value = val;
		if ( this._elInput.value !== prval ) {
			this._updateVal();
		}
	},
	options: function( obj ) {
		var k, v, inp = this._elInput;

		for( k in obj ) {
			v = this[ k ] = obj[ k ];
			k === "startFrom"
				? this.startFrom = v
				: inp[ k ] = v;
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
		var thumb = this._elThumb.style,
			line = this._elLineColor.style,
			inp = this._elInput,
			val = inp.value,
			start = this.startFrom,
			prc = ( val - inp.min ) / ( inp.max - inp.min ) * 100,
			prcStart = ( start - inp.min ) / ( inp.max - inp.min ) * 100;

		this._value = val;
		if ( this._axeX ) {
			thumb.left = prc + "%";
			line.left = ( start < val ? prcStart : prc ) + "%";
			line.right = 100 - ( start < val ? prc : prcStart ) + "%";
		} else {
			thumb.top = 100 - prc + "%";
			line.top = 100 - ( start < val ? prc : prcStart ) + "%";
			line.bottom = ( start < val ? prcStart : prc ) + "%";
		}
	},
	_updateSize: function( w, h ) {
		if ( w !== this.width || h !== this.height ) {
			var thumbSize,
				thumb = this._elThumb.style,
				line = this._elLine.style,
				thick = this._axeX ? h : w,
				thick2 = thick / 2,
				lineThick = Math.ceil( thick / 10 );

			lineThick % 2 !== thick % 2 && ++lineThick;
			if ( this._axeX ) {
				line.height = lineThick + "px";
				line.marginTop = lineThick / -2 + "px";
				line.left = line.right = thick2 + "px";
			} else {
				line.width = lineThick + "px";
				line.marginLeft = lineThick / -2 + "px";
				line.top = line.bottom = thick2 + "px";
			}
			thumbSize = thick - ~~thick2 - ~~thick2 % 2;
			thumb.width = thumb.height = thumbSize + "px";
			thumb.marginLeft = thumb.marginTop = thumbSize / -2 + "px";
			this.width = w;
			this.height = h;
		}
	},
	_wheel: function( e ) {
		var inp = this._elInput,
			dy = e.deltaY > 0 ? -1 : 1;

		if ( this.axeX ) {
			dy = -dy;
		}
		inp.value = +inp.value + inp.step * dy;
		this._updateVal();
	},
	_mousedown: function( e ) {
		gsuiSlider._sliderClicked = this;
		this._rcLine = this._elLine.getBoundingClientRect();
		this._elThumb.classList.add( "gsui-big" );
		this._mousemove( e );
	},
	_mouseup: function( e ) {
		delete gsuiSlider._sliderClicked;
		this._elThumb.classList.remove( "gsui-big" );
	},
	_mousemove: function( e ) {
		var min = +this._elInput.min,
			max = +this._elInput.max,
			y = this._axeX
				? ( e.pageX - this._rcLine.left ) / ( this._rcLine.width - 1 )
				: 1 - ( e.pageY - this._rcLine.top ) / ( this._rcLine.height - 1 );

		this.setValue( min + y * ( max - min ) );
	}
};
