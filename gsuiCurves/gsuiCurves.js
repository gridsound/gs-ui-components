"use strict";

class gsuiCurves extends gsui0ne {
	#size = Object.seal( [ 0, 0 ] );
	#curves = new Map();
	#nyquist = 24000;
	#analyserResolutionDeb = GSUdebounce( w => this.$elements.$analyser.$setAttr( "resolution", w ), .2 );

	constructor() {
		super( {
			$cmpName: "gsuiCurves",
			$tagName: "gsui-curves",
			$elements: {
				$analyser: "gsui-analyser-hz",
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
		const [ w, h ] = GSUdomBCRwh( this.$elements.$svg.$get( 0 ) );

		this.#size[ 0 ] = w;
		this.#size[ 1 ] = h;
		this.$elements.$svg.$viewbox( w, h );
		this.#analyserResolutionDeb( w );
		this.#updateHzTexts();
		this.#updateLinePos();
		this.#curves.forEach( ( curve, id ) => {
			this.$elements.$curves.$find( `[data-id="${ id }"]` ).$setAttr( "d", this.#createPathD( curve ) );
		} );
	}
	$getWidth() {
		return this.#size[ 0 ];
	}
	$drawAnalyser( data ) {
		this.$elements.$analyser.$get( 0 ).$draw( data );
	}
	$setCurve( id, curve ) {
		const path = this.$elements.$curves.$find( `[data-id="${ id }"]` );

		if ( curve ) {
			this.#curves.set( id, curve );
			if ( path.$size() ) {
				path.$setAttr( "d", this.#createPathD( curve ) );
			} else {
				this.#createPath( id, curve );
			}
		} else {
			this.#curves.delete( id );
			path.$remove();
		}
	}

	// .........................................................................
	#updateLinePos() {
		const [ w, h ] = this.#size;

		this.$elements.$line.$setAttr( {
			x1: 0,
			x2: w,
			y1: h / 2,
			y2: h / 2,
		} );
	}
	#updateHzTexts() {
		const el = this.$elements.$marks;
		const nb = this.#size[ 0 ] / 36 | 0;

		if ( nb !== el.$children().$size() ) {
			el.$empty().$append( ...GSUnewArray( nb, i => {
				const Hz = Math.round( GSUXtoHz( i / nb ) * this.#nyquist );

				return GSUcreateDiv( { "data-hz": Hz < 1000 ? Hz : `${ ( Hz / 1000 ).toFixed( 1 ) }k` } );
			} ) );
		}
	}
	#createPath( id, curve ) {
		this.$elements.$curves.$append( GSUcreateElement( "path", {
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

GSUdomDefine( "gsui-curves", gsuiCurves );
