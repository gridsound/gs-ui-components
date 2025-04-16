"use strict";

class gsuiWavetableGraph extends gsui0ne {
	#w = 0;
	#h = 0;
	#boxW = 0;
	#boxH = 0;
	#waves = [];
	#perspective = null;
	#ptrX = 0;
	#ptrY = 0;

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
		this.#waves.length = 0;
		GSUforEach( wt, ( wave, wId ) => {
			const dots = this.#getDots( wave );

			this.#waves.push( {
				id: wId,
				index: wave.index,
				dot0: dots.shift(),
				dots: dots,
			} );
		} );
		this.#waves.sort( ( a, b ) => a.index - b.index );
	}
	#getDots( w ) {
		const dots = GSUsampleDotLine( w.curve, 62 );

		dots.forEach( d => d[ 1 ] = d[ 1 ] / 2 + .5 );
		return [ [ 0, .5 ], ...dots, [ 1, .5 ] ];
	}

	// .........................................................................
	$draw() {
		this.#drawBox();
		GSUsetSVGChildrenNumber( this.$elements.$gWaves, this.#waves.length, "path" );
		this.#waves.forEach( ( wave, i, arr ) => this.#drawWave( this.$elements.$gWaves.children[ i ], wave ) );
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
	#drawWave( el, wave ) {
		const curveDots = [];

		curveDots.push( "M", ...this.#getCoord( wave.dot0[ 0 ], wave.dot0[ 1 ], wave.index ) );
		wave.dots.forEach( dot => curveDots.push( "L", ...this.#getCoord( dot[ 0 ], dot[ 1 ], wave.index ) ) );
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

	// .........................................................................
	$onptrdown( e ) {
		this.style.cursor = "grabbing";
		this.#ptrX = 0;
		this.#ptrY = 0;
	}
	$onptrup( e ) {
		this.style.cursor = "grab";
		this.$setPerspective( {
			camX: .5,
			camY: .5,
		} );
		this.$draw();
	}
	$onptrmove( e ) {
		this.#ptrX += e.movementX;
		this.#ptrY += e.movementY;
		this.$setPerspective( {
			camX: GSUclampNum( 0, 1, .5 - this.#ptrX / 100 ),
			camY: GSUclampNum( 0, 1, .5 + this.#ptrY / 100 ),
		} );
		this.$draw();
	}
}

GSUdefineElement( "gsui-wavetable-graph", gsuiWavetableGraph );
