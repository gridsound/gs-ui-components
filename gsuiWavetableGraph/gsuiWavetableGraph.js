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
				GSUcreateElementSVG( "g", { class: "gsuiWavetableGraph-box" },
					GSUnewArray( 12, () => GSUcreateElementSVG( "line" ) ),
				),
				GSUcreateElementSVG( "g", { class: "gsuiWavetableGraph-waves" } ),
			),
			$elements: {
				$svg: "svg",
				$lines: "[]g:nth-of-type(1) line",
				$gWaves: ".gsuiWavetableGraph-waves",
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
		GSUsetSVGChildrenNumber( this.$elements.$gWaves, this.#waves.length, "polyline" );
		this.#waves.forEach( ( wave, i ) => this.#drawWave( this.$elements.$gWaves.children[ i ], wave ) );
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
		GSUsetAttribute( el, "points", wave.dots.map( dot => this.#getCoord( dot[ 0 ], dot[ 1 ], wave.index ) ).join( " " ) );
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
		const camX2 = camX <= .5
			? camX * 2
			: 1 - 2 * ( camX - .5 );
		const xAmp = camX <= .5
			? 100 + x * ( 1 - camX2 ) * 50
			: camX2 * 100;
		const zAmp = camX <= .5
			? camX2 * 100
			: 100 + z * ( 1 - camX2 ) * 50;

		return this.#w / 2 - this.#boxW / 2
			+ x * xAmp
			+ z * zAmp;
	}
	#calcY( x, y, z ) {
		const { camX, camY } = this.#perspective;
		const camY2 = 100 * -camY;
		const xAmp = camY2 * camX * -2;
		const yAmp = -70 * ( 1 - camY );
		const zAmp = camX <= .5
			? camY2
			: ( camY2 * ( 1 - 2 * ( camX - .5 ) ) );

		return this.#h / 2 - this.#boxH / 2
			+ x * xAmp
			+ y * yAmp
			+ z * zAmp;
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
