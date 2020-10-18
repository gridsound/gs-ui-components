"use strict";

class gsuiCurves extends HTMLElement {
	constructor() {
		const svg = GSUI.getTemplate( "gsui-curves" );

		super();
		this._svg = svg;
		this._line = svg.querySelector( ".gsuiCurves-line" );
		this._marksWrap = svg.querySelector( ".gsuiCurves-marks" );
		this._curvesWrap = svg.querySelector( ".gsuiCurves-curves" );
		this._curves = new Map();
		this._options = Object.seal( {
			nyquist: 24000,
			nbBands: 8,
		} );
		this._size = Object.seal( [ 0, 0 ] );
		Object.freeze( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.classList.add( "gsuiCurves" );
			this.append( this._svg );
		}
	}

	// .........................................................................
	resized() {
		const bcr = this._svg.getBoundingClientRect(),
			w = bcr.width,
			h = bcr.height;

		this._size[ 0 ] = w;
		this._size[ 1 ] = h;
		this._svg.setAttribute( "viewBox", `0 0 ${ w } ${ h }` );
		this.redraw();
	}
	options( opt ) {
		Object.assign( this._options, opt );
		if ( "nbBands" in opt || "nyquist" in opt ) {
			this._updateHzTexts();
		}
	}
	setCurve( id, curve ) {
		const path = this._curvesWrap.querySelector( `[data-id="${ id }"]` );

		if ( curve ) {
			this._curves.set( id, curve );
			if ( path ) {
				path.setAttribute( "d", this._createPathD( curve ) );
			} else {
				this._createPath( id, curve );
			}
		} else {
			this._curves.delete( id );
			path.remove();
		}
	}
	redraw() {
		this._updateHzTexts();
		this._updateLinePos();
		this._curves.forEach( ( curve, id ) => {
			this._curvesWrap.querySelector( `[data-id="${ id }"]` )
				.setAttribute( "d", this._createPathD( curve ) );
		} );
	}
	getWidth() {
		return this._size[ 0 ];
	}

	// .........................................................................
	_updateLinePos() {
		const line = this._line,
			[ w, h ] = this._size;

		line.setAttribute( "x1", 0 );
		line.setAttribute( "x2", w );
		line.setAttribute( "y1", h / 2 );
		line.setAttribute( "y2", h / 2 );
	}
	_updateHzTexts() {
		const [ w, h ] = this._size,
			nb = this._options.nbBands,
			nyquist = this._options.nyquist,
			rects = [],
			marks = [];

		for ( let i = 0; i < nb; ++i ) {
			const txt = document.createElementNS( "http://www.w3.org/2000/svg", "text" ),
				Hz = Math.round( nyquist * ( 2 ** ( i / nb * 11 - 11 ) ) ),
				x = i / nb * w | 0;

			txt.setAttribute( "x", x + 3 );
			txt.setAttribute( "y", 14 );
			txt.classList.add( "gsuiCurves-markText" );
			txt.textContent = Hz < 1000 ? Hz : `${ ( Hz / 1000 ).toFixed( 1 ) }k`;
			marks.push( txt );
			if ( i % 2 === 0 ) {
				const rect = document.createElementNS( "http://www.w3.org/2000/svg", "rect" );

				rect.setAttribute( "x", x );
				rect.setAttribute( "y", 0 );
				rect.setAttribute( "width", w / nb | 0 );
				rect.setAttribute( "height", h );
				rect.setAttribute( "shape-rendering", "crispEdges" );
				rect.classList.add( "gsuiCurves-markBg" );
				rects.push( rect );
			}
		}
		while ( this._marksWrap.lastChild ) {
			this._marksWrap.lastChild.remove();
		}
		this._marksWrap.append( ...rects, ...marks );
	}
	_createPath( id, curve ) {
		const path = document.createElementNS( "http://www.w3.org/2000/svg", "path" );

		path.classList.add( "gsuiCurves-curve" );
		path.dataset.id = id;
		path.setAttribute( "d", this._createPathD( curve ) );
		this._curvesWrap.append( path );
	}
	_createPathD( curve ) {
		const w = this._size[ 0 ],
			len = curve.length,
			d = [ `M 0 ${ this._dbToY( curve[ 0 ] ) } ` ];

		for ( let i = 1; i < len; ++i ) {
		    d.push( `L ${ i / len * w | 0 } ${ this._dbToY( curve[ i ] ) } ` );
		}
		return d.join( "" );
	}
	_dbToY( db ) {
		const h = this._size[ 1 ],
			y = 20 * Math.log( Math.max( db, .0001 ) ) / Math.LN10;

		return h / 2 - y * ( h / 100 );
	}
}

customElements.define( "gsui-curves", gsuiCurves );
