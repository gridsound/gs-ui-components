"use strict";

class gsuiCurves extends gsui0ne {
	#size = Object.seal( [ 0, 0 ] );
	#curves = new Map();
	#nyquist = 24000;

	constructor() {
		super( {
			$cmpName: "gsuiCurves",
			$tagName: "gsui-curves",
			$elements: {
				$svg: "svg",
				$line: ".gsuiCurves-line",
				$marks: ".gsuiCurves-marks",
				$curves: ".gsuiCurves-curves",
			},
		} );
		Object.seal( this );
	}

	// .........................................................................
	$connected() {
		this.$onresize();
	}
	$onresize() {
		const bcr = this.$elements.$svg.getBoundingClientRect();
		const w = bcr.width;
		const h = bcr.height;

		this.#size[ 0 ] = w;
		this.#size[ 1 ] = h;
		GSUsetViewBoxWH( this.$elements.$svg, w, h );
		this.#updateHzTexts();
		this.#updateLinePos();
		this.#curves.forEach( ( curve, id ) => {
			GSUsetAttribute( this.$elements.$curves.querySelector( `[data-id="${ id }"]` ),
				"d", this.#createPathD( curve ) );
		} );
	}
	$getWidth() {
		return this.#size[ 0 ];
	}
	$setCurve( id, curve ) {
		const path = this.$elements.$curves.querySelector( `[data-id="${ id }"]` );

		if ( curve ) {
			this.#curves.set( id, curve );
			if ( path ) {
				GSUsetAttribute( path, "d", this.#createPathD( curve ) );
			} else {
				this.#createPath( id, curve );
			}
		} else {
			this.#curves.delete( id );
			path.remove();
		}
	}

	// .........................................................................
	#updateLinePos() {
		const [ w, h ] = this.#size;

		GSUsetAttribute( this.$elements.$line, {
			x1: 0,
			x2: w,
			y1: h / 2,
			y2: h / 2,
		} );
	}
	#updateHzTexts() {
		const el = this.$elements.$marks;
		const nb = this.#size[ 0 ] / 36 | 0;

		if ( nb !== el.children.length ) {
			GSUemptyElement( el );
			el.append( ...GSUnewArray( nb, i => {
				const Hz = Math.round( GSUXtoHz( i / nb ) * this.#nyquist );

				return GSUcreateDiv( { "data-hz": Hz < 1000 ? Hz : `${ ( Hz / 1000 ).toFixed( 1 ) }k` } );
			} ) );
		}
	}
	#createPath( id, curve ) {
		this.$elements.$curves.append( GSUcreateElementSVG( "path", {
			class: "gsuiCurves-curve",
			"data-id": id,
			d: this.#createPathD( curve ),
		} ) );
	}
	#createPathD( curve ) {
		const w = this.#size[ 0 ];
		const len = curve.length;
		const d = [ `M 0 ${ this.#dbToY( curve[ 0 ] ) } ` ];

		for ( let i = 1; i < len; ++i ) {
		    d.push( `L ${ i / len * w | 0 } ${ this.#dbToY( curve[ i ] ) } ` );
		}
		return d.join( "" );
	}
	#dbToY( db ) {
		const h = this.#size[ 1 ];
		const y = 20 * Math.log( Math.max( db, .0001 ) ) / Math.LN10;

		return h / 2 - y * ( h / 100 );
	}
}

GSUdefineElement( "gsui-curves", gsuiCurves );
