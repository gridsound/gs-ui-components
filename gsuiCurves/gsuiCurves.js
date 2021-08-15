"use strict";

class gsuiCurves extends HTMLElement {
	#size = Object.seal( [ 0, 0 ] )
	#curves = new Map()
	#options = Object.seal( {
		nyquist: 24000,
		nbBands: 8,
	} )
	#children = GSUI.getTemplate( "gsui-curves" )
	#elements = GSUI.findElements( this.#children, {
		svg: "svg",
		line: ".gsuiCurves-line",
		marks: ".gsuiCurves-marks",
		curves: ".gsuiCurves-curves",
	} )

	constructor() {
		super();
		Object.freeze( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.append( this.#children );
			this.#children = null;
		}
	}

	// .........................................................................
	resized() {
		const bcr = this.#elements.svg.getBoundingClientRect(),
			w = bcr.width,
			h = bcr.height;

		this.#size[ 0 ] = w;
		this.#size[ 1 ] = h;
		this.#elements.svg.setAttribute( "viewBox", `0 0 ${ w } ${ h }` );
		this.redraw();
	}
	options( opt ) {
		Object.assign( this.#options, opt );
		if ( "nbBands" in opt || "nyquist" in opt ) {
			this.#updateHzTexts();
		}
	}
	setCurve( id, curve ) {
		const path = this.#elements.curves.querySelector( `[data-id="${ id }"]` );

		if ( curve ) {
			this.#curves.set( id, curve );
			if ( path ) {
				path.setAttribute( "d", this.#createPathD( curve ) );
			} else {
				this.#createPath( id, curve );
			}
		} else {
			this.#curves.delete( id );
			path.remove();
		}
	}
	redraw() {
		this.#updateHzTexts();
		this.#updateLinePos();
		this.#curves.forEach( ( curve, id ) => {
			this.#elements.curves.querySelector( `[data-id="${ id }"]` )
				.setAttribute( "d", this.#createPathD( curve ) );
		} );
	}
	getWidth() {
		return this.#size[ 0 ];
	}

	// .........................................................................
	#updateLinePos() {
		const line = this.#elements.line,
			[ w, h ] = this.#size;

		line.setAttribute( "x1", 0 );
		line.setAttribute( "x2", w );
		line.setAttribute( "y1", h / 2 );
		line.setAttribute( "y2", h / 2 );
	}
	#updateHzTexts() {
		const [ w, h ] = this.#size,
			nb = this.#options.nbBands,
			nyquist = this.#options.nyquist,
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
		while ( this.#elements.marks.lastChild ) {
			this.#elements.marks.lastChild.remove();
		}
		this.#elements.marks.append( ...rects, ...marks );
	}
	#createPath( id, curve ) {
		const path = document.createElementNS( "http://www.w3.org/2000/svg", "path" );

		path.classList.add( "gsuiCurves-curve" );
		path.dataset.id = id;
		path.setAttribute( "d", this.#createPathD( curve ) );
		this.#elements.curves.append( path );
	}
	#createPathD( curve ) {
		const w = this.#size[ 0 ],
			len = curve.length,
			d = [ `M 0 ${ this.#dbToY( curve[ 0 ] ) } ` ];

		for ( let i = 1; i < len; ++i ) {
		    d.push( `L ${ i / len * w | 0 } ${ this.#dbToY( curve[ i ] ) } ` );
		}
		return d.join( "" );
	}
	#dbToY( db ) {
		const h = this.#size[ 1 ],
			y = 20 * Math.log( Math.max( db, .0001 ) ) / Math.LN10;

		return h / 2 - y * ( h / 100 );
	}
}

customElements.define( "gsui-curves", gsuiCurves );
