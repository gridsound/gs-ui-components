"use strict";

window.SVGURL = "http://www.w3.org/2000/svg";

function gsuiDotline() {
	var root = document.createElement( "div" ),
		svg = document.createElementNS( SVGURL, "svg" ),
		polyline = document.createElementNS( SVGURL, "polyline" );

	svg.append( polyline );
	svg.setAttribute( "preserveAspectRatio", "none" );
	root.append( svg );
	root.className = "gsuiDotline";
	root.oncontextmenu = _ => false;
	root.onmousedown = this._mousedown.bind( this );
	this.rootElement = root;
	this._elSVG = svg;
	this._elPoly = polyline;
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
	this.setResolution( 150, 100 );
}

gsuiDotline.prototype = {
	setResolution( w, h ) {
		this._svgW = w;
		this._svgH = h;
		this._elSVG.setAttribute( "viewBox", "0 0 " + w + " " + h );
	},
	resize() {
		return this._rootBCR = this.rootElement.getBoundingClientRect();
	},
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

	// private:
	_drawPolyline() {
		var dots = Object.values( this._dots ),
			w = this._opt.width,
			h = this._opt.height,
			svgW = this._svgW,
			svgH = this._svgH;

		dots.sort( ( a, b ) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0 );
		this._elPoly.setAttribute(
			"points",
			dots.reduce( ( arr, { x, y } ) => {
				arr.push(
					x / w * svgW,
					svgH - y / h * svgH );
				return arr;
			}, [] ).join( " " ) );
	},
	_createDot( x, y ) {
		var element = document.createElement( "div" ),
			id = this._dotsId++;

		this._dots[ id ] = { id, element };
		element.className = "gsuiDotline-dot";
		element.dataset.dotsId = id;
		element.onmousedown = this._mousedownDot.bind( this, id );
		element.onmousemove = this._mousemoveDot.bind( this, id );
		element.onmouseup = this._mouseupDot.bind( this, id );
		this._updateDot( id, x, y );
		this.rootElement.append( element );
		return id;
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
		this._drawPolyline();
	},
	_deleteDot( dotId ) {
		this._dots[ dotId ].element.remove();
		delete this._dots[ dotId ];
		this._drawPolyline();
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
