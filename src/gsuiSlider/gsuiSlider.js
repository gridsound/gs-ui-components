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
		var inp = this._elInput,
			val = inp.value,
			start = this.startFrom,
			prc = ( val - inp.min ) / ( inp.max - inp.min ) * 100,
			prcStart = ( start - inp.min ) / ( inp.max - inp.min ) * 100;

		this._value = val;
		this._elThumb.style.top = 100 - prc + "%";
		this._elLineColor.style.top = ( start < val ? 100 - prc : 100 - prcStart ) + "%";
		this._elLineColor.style.bottom = ( start < val ? prcStart : prc ) + "%";
	},
	_updateSize: function( w, h ) {
		if ( w !== this.width || h !== this.height ) {
			var thumbMrgs = Math.floor( w / 2 ),
				lineW = Math.ceil( w / 10 );

			lineW % 2 !== w % 2 && ++lineW;
			thumbMrgs % 2 && ++thumbMrgs;
			this.width = w;
			this.height = h;
			this._elThumb.style.width =
			this._elThumb.style.height = w - thumbMrgs + "px";
			this._elThumb.style.marginLeft =
			this._elThumb.style.marginTop = ( w - thumbMrgs ) / -2 + "px";
			this._elLine.style.width = lineW + "px";
			this._elLine.style.marginLeft = lineW / -2 + "px";
			this._elLine.style.top =
			this._elLine.style.bottom = w / 2 + "px";
		}
	},
	_wheel: function( e ) {
		var inp = this._elInput,
			dy = e.deltaY > 0 ? -1 : 1;

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
		var y = 1 - ( e.pageY - this._rcLine.top ) / ( this._rcLine.height - 1 ),
			min = +this._elInput.min,
			max = +this._elInput.max;

		this.setValue( min + y * ( max - min ) );
	}
};
