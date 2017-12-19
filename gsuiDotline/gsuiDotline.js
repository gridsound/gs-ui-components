"use strict";

function gsuiDotline() {
	var root = document.createElement( "div" );

	root.className = "gsuiDotline";
	root.oncontextmenu = _ => false;
	root.onmousedown = this._mousedown.bind( this );
	this.rootElement = root;
	this._dots = {};
	this._dotsId = 0;
	this._nlDots = root.getElementsByClassName( "gsuiDotline-dot" );
	this._opt = {};
	this.options( {
		minX: 0,
		minY: 0,
		maxX: 150,
		maxY: 100,
	} );
	this._rootBCR = {
		width: 150,
		height: 100
	};
}

gsuiDotline.prototype = {
	options( obj ) {
		var opt = this._opt;

		Object.assign( opt, obj );
		opt.width = opt.maxX - opt.minX;
		opt.height = opt.maxY - opt.minY;
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
		return this._rootBCR = this.rootElement.getBoundingClientRect();
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
		return dotId;
	},
	_updateDot( dotId, x, y ) {
		var bcr = this._rootBCR,
			opt = this._opt,
			dot = this._dots[ dotId ],
			dotStyle = dot.element.style;

		dot.x = Math.max( 0, Math.min( x, opt.width ) );
		dot.y = Math.max( 0, Math.min( y, opt.height ) );
		dotStyle.left = dot.x / opt.width * bcr.width + "px";
		dotStyle.top = bcr.height - ( dot.y / opt.height * bcr.height ) + "px";
	},
	_deleteDot( dotId ) {
		this._dots[ dotId ].element.remove();
		delete this._dots[ dotId ];
	},
	_selectDot( dotId, b ) {
		this._locked = b;
		this._dots[ dotId ].element.classList.toggle( "gsuiDotline-dotSelected", b );
		if ( b ) {
			this._dots[ dotId ].element.setCapture( true );
		}
	},

	// events:
	_mousedown( e ) {
		if ( e.button === 0 ) {
			var opt = this._opt,
				bcr = this.resize();

			this._selectDot(
				this._createDot(
					( e.pageX - bcr.left ) / bcr.width * opt.width,
					opt.height - ( e.pageY - bcr.top ) / bcr.height * opt.height
				), true );
		}
	},
	_mousedownDot( dotId, e ) {
		e.stopPropagation();
		if ( e.button === 2 ) {
			this._deleteDot( dotId );
		} else if ( e.button === 0 ) {
			this.resize();
			this._selectDot( dotId, true );
		}
	},
	_mousemoveDot( dotId, e ) {
		if ( this._locked ) {
			var bcr = this._rootBCR,
				opt = this._opt,
				dot = this._dots[ dotId ];

			this._updateDot( dotId,
				dot.x + opt.width / bcr.width * e.movementX,
				dot.y - opt.height / bcr.height * e.movementY );
		}
	},
	_mouseupDot( dotId ) {
		this._selectDot( dotId, false );
	}
};
