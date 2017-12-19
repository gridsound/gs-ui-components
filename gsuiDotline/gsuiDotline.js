"use strict";

function gsuiDotline() {
	this.rootElement = document.createElement( "div" );
	this.rootElement.className = "gsuiDotline";
	this.rootElement.oncontextmenu = _ => false;
	this._dots = {};
	this._dotsId = 0;
	this._nlDots = this.rootElement.getElementsByClassName( "gsuiDotline-dot" );
	this._rootBCR = {
		width: 150,
		height: 100
	};
}

gsuiDotline.prototype = {
	dimensions( w, h ) {
		this._width = w;
		this._height = h;
	},
	setDots( arr ) {
		var dots = this._nlDots;

		arr.forEach( ( [ x, y ], i ) => {
			if ( i < dots.length ) {
				this._updateDot( dots[ i ].dataset.dotsId, x, y );
			} else {
				this._createDot( x, y );
			}
		} );
	},
	getDots() {
		return this._dots;
	},
	resize() {
		this._rootBCR = this.rootElement.getBoundingClientRect();
	},

	// private:
	_createDot( x, y ) {
		var element = document.createElement( "div" ),
			dotId = this._dotsId++;

		this._dots[ dotId ] = { element };
		element.className = "gsuiDotline-dot";
		element.dataset.dotsId = dotId;
		element.onmousedown = this._mousedownDot.bind( this, dotId );
		element.onmousemove = this._mousemoveDot.bind( this, dotId );
		element.onmouseup = this._mouseupDot.bind( this, dotId );
		this._updateDot( dotId, x, y );
		this.rootElement.append( element );
	},
	_updateDot( dotId, x, y ) {
		var bcr = this._rootBCR,
			dot = this._dots[ dotId ],
			dotStyle = dot.element.style;

		dot.x = Math.max( 0, Math.min( x, this._width ) );
		dot.y = Math.max( 0, Math.min( y, this._height ) );
		dotStyle.left = dot.x / this._width * bcr.width + "px";
		dotStyle.top = bcr.height - ( dot.y / this._height * bcr.height ) + "px";
	},
	_deleteDot( dotId ) {
		this._dots[ dotId ].element.remove();
		delete this._dots[ dotId ];
	},
	_selectDot( dotId, b ) {
		this._dots[ dotId ].element.classList.toggle( "gsuiDotline-dotSelected", b );
	},

	// events:
	_mousedownDot( dotId, e ) {
		if ( e.button === 2 ) {
			this._deleteDot( dotId );
		} else if ( e.button === 0 ) {
			this.resize();
			this._selectDot( dotId, true );
			this._locked = true;
			this._dots[ dotId ].element.setCapture( true );
		}
	},
	_mousemoveDot( dotId, e ) {
		if ( this._locked ) {
			var bcr = this._rootBCR,
				dot = this._dots[ dotId ];

			this._updateDot( dotId,
				dot.x + this._width / bcr.width * e.movementX,
				dot.y - this._height / bcr.height * e.movementY );
		}
	},
	_mouseupDot( dotId ) {
		delete this._locked;
		this._selectDot( dotId, false );
	}
};
