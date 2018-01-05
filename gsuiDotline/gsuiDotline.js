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
	this._dots = [];
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
	this.lineToEdges( 0 );
	this.dotsMoveMode( "free" );
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
	dotsMoveMode( mode ) {
		this._dotsMoveMode = mode;
	},
	lineToEdges( val ) {
		this._lineToEdges = val;
		this._drawPolyline();
	},
	setDots( arr ) {
		var dots = this._nlDots;

		arr.forEach( ( [ x, y ], i ) => {
			if ( i < dots.length ) {
				this._updateDot( dots[ i ].dataset.dotsId, x, y );
			} else {
				this._createDot( x, y );
			}
			this._sortDots();
			this._drawPolyline();
		} );
	},
	getDots() {
		return this._dots;
	},

	// private:
	_sortDots() {
		this._dots.sort( ( a, b ) => a.x < b.x ? -1 : a.x > b.x ? 1 : 0 );
	},
	_computeValue() {
		return this._dots.map( d => d.x + " " + d.y ).join( "," );
	},
	_drawPolyline() {
		var dots = this._dots,
			svgW = this._svgW,
			svgH = this._svgH,
			arr = [],
			lineEdgeVal = this._lineToEdges,
			lineToEdges = Number.isFinite( lineEdgeVal ),
			{
				width,
				height,
				minX,
				minY
			} = this._opt;

		if ( lineToEdges ) {
			lineEdgeVal = svgH - ( lineEdgeVal - minY ) / height * svgH;
			arr.push( 0, lineEdgeVal );
		}
		dots.forEach( ( { x, y } ) => {
			arr.push(
				( x - minX ) / width * svgW,
				svgH - ( y - minY ) / height * svgH );
		} );
		if ( lineToEdges ) {
			arr.push( svgW, lineEdgeVal );
		}
		this._elPoly.setAttribute( "points", arr.join( " " ) );
	},
	_createDot( x, y ) {
		var element = document.createElement( "div" ),
			id = "i" + ( this._dotsId++ ),
			dot = { id, element };

		this._dots.push( dot );
		this._dots[ id ] = dot;
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

		dot.x = Math.max( opt.minX, Math.min( x, opt.maxX ) );
		dot.y = Math.max( opt.minY, Math.min( y, opt.maxY ) );
		dotStyle.left = ( dot.x - opt.minX ) / opt.width * bcr.width + "px";
		dotStyle.top = bcr.height - ( ( dot.y - opt.minY ) / opt.height * bcr.height ) + "px";
	},
	_deleteDot( dotId ) {
		var dots = this._dots;

		dots[ dotId ].element.remove();
		dots.splice( dots.findIndex( dot => dot.id === dotId ), 1 );
		delete dots[ dotId ];
		this._drawPolyline();
	},
	_selectDot( dotId, b ) {
		var dots = this._dots,
			dot = dots[ dotId ];

		this._locked = b;
		dot.element.classList.toggle( "gsuiDotline-dotSelected", b );
		this._dotInd = dots.findIndex( d => d.id === dotId );
		if ( b ) {
			dot.element.setCapture( true );
		}
	},
	_updateValue( isInputOrBoth ) {
		var val = this._computeValue();

		if (
			isInputOrBoth === 2 ||
			( isInputOrBoth && val !== this._prevValueInput ) ||
			( !isInputOrBoth && val !== this._prevValue )
		) {
			this.value = val;
			if ( isInputOrBoth ) {
				this._prevValueInput = val;
				this.oninput && this.oninput( val );
			}
			if ( !isInputOrBoth || isInputOrBoth === 2 ) {
				this._prevValue = val;
				this.onchange && this.onchange( val );
			}
		}
	},

	// events:
	_mousedown( e ) {
		if ( e.button === 0 ) {
			var opt = this._opt,
				bcr = this.resize(),
				h = opt.height,
				dotId = this._createDot(
					( e.pageX - bcr.left ) / bcr.width * opt.width + opt.minX,
					h - ( e.pageY - bcr.top ) / bcr.height * h + opt.minY
				);

			this._sortDots();
			this._drawPolyline();
			this._selectDot( dotId, true );
			this._updateValue( 1 );
		}
	},
	_mousedownDot( dotId, e ) {
		e.stopPropagation();
		if ( e.button === 2 ) {
			this._deleteDot( dotId );
			this._updateValue( 2 );
		} else if ( e.button === 0 ) {
			this.resize();
			this._prevValueInput =
			this._prevValue = this.value;
			this._selectDot( dotId, true );
		}
	},
	_mousemoveDot( dotId, e ) {
		if ( this._locked ) {
			var dot,
				opt = this._opt,
				dots = this._dots,
				dotInd = this._dotInd,
				bcr = this._rootBCR,
				xInc = opt.width / bcr.width * e.movementX,
				yInc = opt.height / bcr.height * e.movementY;

			switch ( this._dotsMoveMode ) {
				case "free":
					dot = dots[ dotId ];
					this._updateDot( dotId, dot.x + xInc, dot.y - yInc );
					this._sortDots();
					break;
				case "linked":
					while ( dot = dots[ dotInd++ ] ) {
						this._updateDot( dot.id, dot.x + xInc, dot.y - yInc );
					}
					this._sortDots();
					break;
			}
			this._drawPolyline();
			this._updateValue( 1 );
		}
	},
	_mouseupDot( dotId ) {
		if ( this._locked ) {
			this._selectDot( dotId, false );
			this._updateValue();
		}
	}
};
