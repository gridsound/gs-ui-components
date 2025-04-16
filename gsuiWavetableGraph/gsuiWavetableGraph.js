"use strict";

class gsuiWavetableGraph extends gsui0ne {
	#w = 0;
	#h = 0;
	#boxW = 0;
	#boxH = 0;
	#waves = {};
	#perspective = null;

	constructor() {
		super( {
			$cmpName: "gsuiWavetableGraph",
			$tagName: "gsui-wavetable-graph",
			$template: GSUcreateElementSVG( "svg", { preserveAspectRatio: "none", inert: true },
				GSUnewArray( 12, () => GSUcreateElementSVG( "line" ) ),
				GSUcreateElementSVG( "g" ),
			),
			$elements: {
				$svg: "svg",
				$lines: "[]line",
				$gWaves: "g:nth-of-type(1)",
			},
		} );
		Object.seal( this );
		this.$setPerspective( { camX: .5, camY: .5 } );
	}

	// .........................................................................
	$setResolution( w, h ) {
		this.#w = w;
		this.#h = h;
		GSUsetViewBoxWH( this.$element, w, h );
	}
	$setPerspective( obj ) {
		this.#perspective = obj;
		this.#boxW = this.#calcX( 1, 1, 1 ) - this.#calcX( 0, 0, 0 );
		this.#boxH = this.#calcY( 1, 1, 1 ) - this.#calcY( 0, 0, 0 );
	}
	$setWavetable( wt ) {
		this.#waves = {};
		GSUforEach( wt, ( wave, wId ) => {
			const dots = this.#getDots( wave );

			this.#waves[ wId ] = {
				d0: dots.shift(),
				rest: dots,
			};
		} );
	}
	#getDots( w ) {
		const dots = GSUsampleDotLine( w.curve, 62 );

		dots.forEach( d => d[ 1 ] = d[ 1 ] / 2 + .5 );
		return [ [ 0, .5 ], ...dots, [ 1, .5 ] ];
	}

	// .........................................................................
	$draw( wt ) {
		const wtEnt = Object.entries( wt ).sort( ( a, b ) => a[ 1 ].index - b[ 1 ].index );

		this.#drawBox();
		GSUsetSVGChildrenNumber( this.$elements.$gWaves, wtEnt.length, "path" );
		wtEnt.forEach( ( [ wId, wave ], i, arr ) => this.#drawWave( this.$elements.$gWaves.children[ i ], wId, !i ? 0 : i / ( arr.length - 1 ) ) );
	}
	#drawBox() {
		const l = this.$elements.$lines;

		gsuiWavetableGraph.#drawLine( l[  0 ], this.#getCoord( 0, 0, 0 ), this.#getCoord( 1, 0, 0 ) );
		gsuiWavetableGraph.#drawLine( l[  1 ], this.#getCoord( 1, 0, 0 ), this.#getCoord( 1, 1, 0 ) );
		gsuiWavetableGraph.#drawLine( l[  2 ], this.#getCoord( 1, 0, 0 ), this.#getCoord( 1, 0, 1 ) );
		gsuiWavetableGraph.#drawLine( l[  3 ], this.#getCoord( 0, 0, 0 ), this.#getCoord( 0, 0, 1 ) );
		gsuiWavetableGraph.#drawLine( l[  4 ], this.#getCoord( 0, 0, 1 ), this.#getCoord( 1, 0, 1 ) );
		gsuiWavetableGraph.#drawLine( l[  5 ], this.#getCoord( 0, 0, 0 ), this.#getCoord( 0, 1, 0 ) );
		gsuiWavetableGraph.#drawLine( l[  6 ], this.#getCoord( 0, 0, 1 ), this.#getCoord( 0, 1, 1 ) );
		gsuiWavetableGraph.#drawLine( l[  7 ], this.#getCoord( 1, 0, 1 ), this.#getCoord( 1, 1, 1 ) );
		gsuiWavetableGraph.#drawLine( l[  8 ], this.#getCoord( 0, 1, 0 ), this.#getCoord( 0, 1, 1 ) );
		gsuiWavetableGraph.#drawLine( l[  9 ], this.#getCoord( 1, 1, 0 ), this.#getCoord( 1, 1, 1 ) );
		gsuiWavetableGraph.#drawLine( l[ 10 ], this.#getCoord( 0, 1, 0 ), this.#getCoord( 1, 1, 0 ) );
		gsuiWavetableGraph.#drawLine( l[ 11 ], this.#getCoord( 0, 1, 1 ), this.#getCoord( 1, 1, 1 ) );
	}
	static #drawLine( line, a, b ) {
		GSUsetAttribute( line, { x1: a[ 0 ], y1: a[ 1 ], x2: b[ 0 ], y2: b[ 1 ] } );
	}
	#drawWave( el, wId, z ) {
		const dots = this.#waves[ wId ];
		const curveDots = [];

		curveDots.push( "M", ...this.#getCoord( dots.d0[ 0 ], dots.d0[ 1 ], z ) );
		dots.rest.forEach( dot => curveDots.push( "L", ...this.#getCoord( dot[ 0 ], dot[ 1 ], z ) ) );
		GSUsetAttribute( el, "d", curveDots.join( " " ) );
	}

	// .........................................................................
	#getCoord( x, y, z ) {
		return [
			this.#calcX( x, y, z ),
			this.#calcY( x, y, z ),
		];
	}
	#calcX( x, y, z ) {
		const { camX } = this.#perspective;
		const margin = this.#w / 2 - this.#boxW / 2;
		const camX2 = camX <= .5
			? camX * 2
			: 1 - 2 * ( camX - .5 );

		if ( camX <= .5 ) {
			return margin
				+ x * 100 + x * ( 1 - camX2 ) * 50
				+ z * camX2 * 100;
		}
		return margin
			+ x * camX2 * 100
			+ z * 100 + z * ( 1 - camX2 ) * 50;
	}
	#calcY( x, y, z ) {
		const { camX, camY } = this.#perspective;
		const margin = this.#h / 2 - this.#boxH / 2;
		const h2 = 20 + 50 * ( 1 - camY );
		const camY2 = 100 * -camY;
		const camY3 = camY2 * camX * 2;

		if ( camX <= .5 ) {
			return margin
				- x * camY3
				+ -y * h2
				+ z * camY2;
		}

		const camX2 = 1 - ( ( camX - .5 ) * 2 );

		return margin
			- x * camY3
			+ -y * h2
			+ z * ( camY2 * camX2 );
	}
}

GSUdefineElement( "gsui-wavetable-graph", gsuiWavetableGraph );
