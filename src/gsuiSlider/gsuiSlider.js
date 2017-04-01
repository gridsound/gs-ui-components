"use strict";

function gsuiSlider( elRoot ) {
	this.elRoot = elRoot;
	this.elThumb = elRoot.querySelector( ".gsui-thumb" );
	this.elLine = elRoot.querySelector( ".gsui-line" );
	this.elLineColor = elRoot.querySelector( ".gsui-lineColor" );
	this.input = elRoot.querySelector( "input" );
	this._startFrom = 0;
	this.elRoot.onwheel = this._wheel.bind( this );
}

gsuiSlider.prototype = {
	value: function( val ) {
		this.input.value = val;
		this._updateVal();
	},
	options: function( obj ) {
		var inp = this.input;

		for( var k in obj ) {
			if ( k === "startFrom" ) {
				this._startFrom = obj[ k ];
			} else {
				inp[ k ] = obj[ k ];
			}
		}
		this._startFrom = Math.max( inp.min, Math.min( this._startFrom, inp.max ) );
		this._updateVal();
	},
	resize: function( w, h ) {
		this.elRoot.style.width = w + "px";
		this.elRoot.style.height = h + "px";
		this._updateSize( w, h );
	},
	resized: function() {
		var rc = this.elRoot.getBoundingClientRect();

		this._updateSize( rc.width, rc.height );
	},

	// private:
	_updateVal: function() {
		var inp = this.input,
			val = inp.value,
			start = this._startFrom,
			prc = ( val - inp.min ) / ( inp.max - inp.min ) * 100,
			prcStart = ( start - inp.min ) / ( inp.max - inp.min ) * 100;

		this._value = val;
		this.elThumb.style.top = 100 - prc + "%";
		this.elLineColor.style.top = ( start < val ? 100 - prc : 100 - prcStart ) + "%";
		this.elLineColor.style.bottom = ( start < val ? prcStart : prc ) + "%";
	},
	_updateSize: function( w, h ) {
		if ( w !== this.width || h !== this.height ) {
			var thumbMrgs = Math.floor( w / 2 ),
				lineW = Math.ceil( w / 10 );

			lineW % 2 !== w % 2 && ++lineW;
			thumbMrgs % 2 && ++thumbMrgs;
			this.width = w;
			this.height = h;
			this.elThumb.style.width =
			this.elThumb.style.height = w - thumbMrgs + "px";
			this.elThumb.style.marginLeft =
			this.elThumb.style.marginTop = ( w - thumbMrgs ) / -2 + "px";
			this.elLine.style.width = lineW + "px";
			this.elLine.style.marginLeft = lineW / -2 + "px";
			this.elLine.style.top =
			this.elLine.style.bottom = w / 2 + "px";
		}
	},
	_wheel: function( e ) {
		var inp = this.input,
			dy = e.deltaY > 0 ? -1 : 1;

		inp.value = +inp.value + inp.step * dy;
		this._updateVal();
	}
};
