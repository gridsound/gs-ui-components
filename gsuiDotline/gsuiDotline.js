"use strict";

class gsuiDotline {
	constructor() {
		const root = document.createElement( "div" ),
			svg = document.createElementNS( "http://www.w3.org/2000/svg", "svg" ),
			polyline = document.createElementNS( "http://www.w3.org/2000/svg", "polyline" );

		this.rootElement = root;
		this.oninput =
		this.onchange = () => {};
		this._data = {};
		this._dots = {};
		this._dotsMoving = [];
		this._elSVG = svg;
		this._elPoly = polyline;
		this._opt = {};
		this._dotsId =
		this._svgW =
		this._svgH =
		this._pageX =
		this._pageY =
		this._dotMaxX =
		this._dotMinX =
		this._dotMaxY =
		this._dotMinY =
		this._mousebtn = 0;
		this._nlDots = root.getElementsByClassName( "gsuiDotline-dot" );
		this._rootBCR =
		this._activeDot =
		this._dotsMoveMode =
		this._attached = false;
		this._mouseupDot = this._mouseupDot.bind( this );
		this._mousemoveDot = this._mousemoveDot.bind( this );
		Object.seal( this );

		svg.append( polyline );
		svg.setAttribute( "preserveAspectRatio", "none" );
		root.append( svg );
		root.className = "gsuiDotline";
		root.oncontextmenu = () => false;
		root.onmousedown = this._mousedown.bind( this );
		this.options( {
			step: 1,
			minX: 0,
			minY: 0,
			maxX: 150,
			maxY: 100,
			firstDotLinked: null,
			lastDotLinked: null,
		} );
		this.dotsMoveMode( "free" );
	}

	attached() {
		this._attached = true;
		this.resize();
	}
	resize() {
		const bcr = this.updateBCR();

		this._elSVG.setAttribute( "viewBox", `0 0 ${
			( this._svgW = bcr.width ) } ${
			( this._svgH = bcr.height ) }` );
		this._drawPolyline();
	}
	options( obj ) {
		const opt = this._opt;

		Object.assign( opt, obj );
		opt.width = opt.maxX - opt.minX;
		opt.height = opt.maxY - opt.minY;
		this._drawPolyline();
	}
	dotsMoveMode( mode ) {
		// mode -> "free" || "linked"
		this._dotsMoveMode = mode;
	}
	updateBCR() {
		return this._rootBCR = this.rootElement.getBoundingClientRect();
	}
	change( diff ) {
		Object.entries( diff ).forEach( ( [ id, diffDot ] ) => {
			if ( !diffDot ) {
				delete this._data[ id ];
				this._deleteDotElement( id );
			} else {
				const opt = this._opt,
					dat = this._data[ id ],
					x = "x" in diffDot ? this._epureN( diffDot.x, opt.minX, opt.maxX ) : dat ? dat.x : 0,
					y = "y" in diffDot ? this._epureN( diffDot.y, opt.minY, opt.maxY ) : dat ? dat.y : 0;

				if ( dat ) {
					this._updateDotElement( id, x, y );
				} else {
					this._data[ id ] = { x, y };
					this._createDotElement( id );
					this._updateDotElement( id, x, y );
				}
			}
		} );
		this._drawPolyline();
	}

	// private:
	_sortDots( a, b ) {
		return a.x < b.x ? -1 : a.x > b.x ? 1 : 0;
	}
	_drawPolyline() {
		const arr = [],
			dots = Object.values( this._dots ).sort( this._sortDots ),
			svgW = this._svgW,
			svgH = this._svgH,
			{
				minX, minY,
				width, height,
				firstDotLinked,
				lastDotLinked,
			} = this._opt;

		if ( firstDotLinked !== null ) {
			arr.push( 0, svgH - ( firstDotLinked - minY ) / height * svgH );
		}
		dots.forEach( dot => {
			arr.push(
				( dot.x - minX ) / width * svgW,
				svgH - ( dot.y - minY ) / height * svgH
			);
		} );
		if ( lastDotLinked !== null ) {
			arr.push( svgW, svgH - ( lastDotLinked - minY ) / height * svgH );
		}
		this._elPoly.setAttribute( "points", arr.join( " " ) );
	}
	_onchange() {
		const obj = {},
			data = this._data,
			dataEnt = Object.entries( data );
		let diff;

		dataEnt.forEach( ( [ id, { x, y } ] ) => {
			const newDot = this._dots[ id ];

			if ( !newDot ) {
				diff = true;
				obj[ id ] = undefined;
				delete data[ id ];
			} else if ( newDot.x !== x || newDot.y !== y ) {
				diff = true;
				obj[ id ] = {};
				if ( newDot.x !== x ) { obj[ id ].x = newDot.x; data[ id ].x = newDot.x; };
				if ( newDot.y !== y ) { obj[ id ].y = newDot.y; data[ id ].y = newDot.y; };
			}
		} );
		Object.values( this._dots ).forEach( ( { id, x, y } ) => {
			const oldDot = data[ id ];

			if ( !oldDot ) {
				diff = true;
				obj[ id ] =
				data[ id ] = { x, y };
			}
		} );
		if ( diff ) {
			this.onchange( obj );
		}
	}

	// Math functions
	// .........................................................................
	_epurePageX( px ) {
		const o = this._opt,
			r = this._rootBCR;

		return ( px - r.left ) / r.width * o.width + o.minX;
	}
	_epurePageY( py ) {
		const o = this._opt,
			r = this._rootBCR;

		return o.height - ( py - r.top ) / r.height * o.height + o.minY;
	}
	_epureN( n, min, max ) {
		const step = this._opt.step,
			cut = Math.max( min, Math.min( n, max ) );

		return +( Math.round( cut / step ) * step ).toFixed( 5 );
	}

	// dots[].element
	// .........................................................................
	_createDotElement( id ) {
		const el = document.createElement( "div" );

		el.className = "gsuiDotline-dot";
		el.dataset.id = id;
		this._dotsId = Math.max( this._dotsId, id );
		this.rootElement.append( el );
		return this._dots[ id ] = { id, element: el, x: 0, y: 0 };
	}
	_updateDotElement( id, x, y ) {
		const opt = this._opt,
			dot = this._dots[ id ];

		dot.x = x;
		dot.y = y;
		dot.element.style.left = `${ ( x - opt.minX ) / opt.width * 100 }%`;
		dot.element.style.top = `${ 100 - ( ( y - opt.minY ) / opt.height * 100 ) }%`;
	}
	_deleteDotElement( id ) {
		this._dots[ id ].element.remove();
		delete this._dots[ id ];
	}
	_selectDotElement( id, b ) {
		const dot = this._dots[ id ];

		this._activeDot = b ? dot : null;
		dot.element.classList.toggle( "gsuiDotline-dotSelected", b );
	}

	// events:
	// .........................................................................
	_toggleMouseEvents( b ) {
		if ( b ) {
			document.addEventListener( "mouseup", this._mouseupDot );
			document.addEventListener( "mousemove", this._mousemoveDot );
		} else {
			document.removeEventListener( "mouseup", this._mouseupDot );
			document.removeEventListener( "mousemove", this._mousemoveDot );
		}
	}
	_mousedown( e ) {
		let id = e.target.dataset.id;

		this._toggleMouseEvents( true );
		this._mousebtn = e.button;
		if ( e.button === 2 ) {
			if ( id ) {
				this._deleteDotElement( id );
				this._drawPolyline();
				this.oninput( id );
			}
		} else if ( e.button === 0 ) {
			const bcr = this.updateBCR();
			let isAfter = false,
				dot,
				prevDot;

			if ( id ) {
				dot = this._dots[ id ];
			} else {
				const x = this._epurePageX( e.pageX ),
					y = this._epurePageY( e.pageY );

				id = this._dotsId + 1;
				dot = this._createDotElement( id );
				this._updateDotElement( id, x, y );
				this._drawPolyline();
				this.oninput( id, x, y );
			}
			this._selectDotElement( id, true );
			this._pageX = e.pageX;
			this._pageY = e.pageY;
			if ( this._dotsMoveMode !== "linked" ) {
				this._dotsMoving = [ dot ];
				this._dotMaxX = dot.x;
				this._dotMaxY = dot.y;
				this._dotMinX = dot.x;
				this._dotMinY = dot.y;
			} else {
				this._dotMaxX =
				this._dotMaxY = -Infinity;
				this._dotMinX =
				this._dotMinY = Infinity;
				this._dotsMoving = Object.values( this._dots )
					.sort( this._sortDots )
					.filter( ( d, i, arr ) => {
						isAfter = isAfter || d === dot;
						if ( isAfter ) {
							this._dotMaxX = Math.max( d.x, this._dotMaxX );
							this._dotMaxY = Math.max( d.y, this._dotMaxY );
							this._dotMinX = Math.min( d.x, this._dotMinX );
							this._dotMinY = Math.min( d.y, this._dotMinY );
						}
						if ( arr[ i + 1 ] === dot ) {
							prevDot = d;
						}
						return isAfter;
					} );
				if ( prevDot ) {
					this._dotMinX -= prevDot.x;
				}
			}
			this._dotsMoving.forEach( dot => {
				dot._saveX = dot.x;
				dot._saveY = dot.y;
			} );
		}
	}
	_mouseupDot() {
		if ( this._activeDot ) {
			this._selectDotElement( this._activeDot.id, false );
		}
		this._toggleMouseEvents( false );
		this._dotsMoving.forEach( dot => {
			delete dot._saveX;
			delete dot._saveY;
		} );
		this._dotsMoving.length = 0;
		this._onchange();
	}
	_mousemoveDot( e ) {
		if ( this._mousebtn === 0 ) {
			const opt = this._opt;
			let incX = opt.width / this._rootBCR.width * ( e.pageX - this._pageX ),
				incY = opt.height / this._rootBCR.height * -( e.pageY - this._pageY );

			if ( incX ) {
				incX = incX < 0
					? Math.max( incX, opt.minX - this._dotMinX )
					: Math.min( incX, opt.maxX - this._dotMaxX );
			}
			if ( incY ) {
				incY = incY < 0
					? Math.max( incY, opt.minY - this._dotMinY )
					: Math.min( incY, opt.maxY - this._dotMaxY );
			}
			this._dotsMoving.forEach( dot => {
				const id = dot.id,
					x = this._epureN( dot._saveX + incX, opt.minX, opt.maxX ),
					y = this._epureN( dot._saveY + incY, opt.minY, opt.maxY );

				this._updateDotElement( id, x, y );
				this.oninput( id, x, y );
			} );
			this._drawPolyline();
		}
	}
}
