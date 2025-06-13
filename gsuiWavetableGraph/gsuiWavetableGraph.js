"use strict";

class gsuiWavetableGraph extends gsui0ne {
	#w = 0;
	#h = 0;
	#boxW = 0;
	#boxH = 0;
	#drawSz = 100;
	#waves = [];
	#perspective = { camX: .5, camY: .5 };
	#selectedWave = null;
	#morphingWaveAt = -1;

	constructor() {
		super( {
			$cmpName: "gsuiWavetableGraph",
			$tagName: "gsui-wavetable-graph",
			$template: GSUcreateElementSVG( "svg", { preserveAspectRatio: "none", inert: true },
				GSUcreateElementSVG( "g", { class: "gsuiWavetableGraph-box" },
					GSUnewArray( 12, () => GSUcreateElementSVG( "line" ) ),
				),
				GSUcreateElementSVG( "g", { class: "gsuiWavetableGraph-interp" },
					GSUnewArray( 32, () => GSUcreateElementSVG( "polyline" ) ),
				),
				GSUcreateElementSVG( "g", { class: "gsuiWavetableGraph-waves" } ),
				GSUcreateElementSVG( "g", { class: "gsuiWavetableGraph-morph" },
					GSUcreateElementSVG( "polyline" ),
					GSUcreateElementSVG( "polyline" ),
				),
			),
			$elements: {
				$svg: "svg",
				$lines: "[]g:nth-of-type(1) line",
				$inters: "[]g:nth-of-type(2) polyline",
				$gWaves: ".gsuiWavetableGraph-waves",
				$gMorph: ".gsuiWavetableGraph-morph",
			},
		} );
		Object.seal( this );
	}

	// .........................................................................
	$onresize( w, h ) {
		this.$setResolution( w, h );
		this.$draw();
	}
	$setResolution( w, h ) {
		this.#w = w;
		this.#h = h;
		this.#drawSz = Math.min( this.#w, this.#h ) / 2.1;
		GSUsetViewBoxWH( this.$element, w, h );
	}
	#setPerspective( obj ) {
		this.#perspective.camX = obj.camX ?? this.#perspective.camX;
		this.#perspective.camY = obj.camY ?? this.#perspective.camY;
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
	$selectCurrentWave( wId ) {
		this.#selectedWave = wId;
	}
	$setMorphingWaveAt( index ) {
		this.#morphingWaveAt = index;
		this.#drawMorph();
	}
	#getDots( w ) {
		const dots = GSUmathSampleDotLine( w.curve, 80 );

		dots.forEach( d => d[ 1 ] = d[ 1 ] / 2 + .5 );
		return [ [ 0, .5 ], ...dots, [ 1, .5 ] ];
	}

	// .........................................................................
	$draw() {
		this.#boxW = this.#calcX( 1, 1, 1 ) - this.#calcX( 0, 0, 0 );
		this.#boxH = this.#calcY( 1, 1, 1 ) - this.#calcY( 0, 0, 0 );
		this.#drawBox();
		GSUsetSVGChildrenNumber( this.$elements.$gWaves, this.#waves.length * 2, "polyline" );
		this.#waves.forEach( this.#drawWave.bind( this ) );
		// this.$elements.$inters.forEach( ( inter, i, arr ) => this.#drawInter( inter, i / ( arr.length - 1 ) ) );
		this.#drawMorph();
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
	#drawMorph() {
		const z = this.#morphingWaveAt;
		const g = this.$elements.$gMorph;

		if ( z >= 0 ) {
			const waveA = this.#waves.findLast( w => w.index <= z );
			const waveB = this.#waves.find( w => w.index > z );

			if ( waveA || waveB ) {
				let curveDots;

				if ( !waveA ) {
					curveDots = waveB.dots;
				} else if ( !waveB ) {
					curveDots = waveA.dots;
				} else {
					const avgZ = ( z - waveA.index ) / ( waveB.index - waveA.index );

					curveDots = waveA.dots.map( ( wA, i ) => [
						wA[ 0 ] * ( 1 - avgZ ) + waveB.dots[ i ][ 0 ] * avgZ,
						wA[ 1 ] * ( 1 - avgZ ) + waveB.dots[ i ][ 1 ] * avgZ,
					] );
				}
				this.#drawWave2( null, curveDots, g, 0, z );
				return;
			}
		}
		GSUdomRmAttr( g.children[ 0 ], "points" );
		GSUdomRmAttr( g.children[ 1 ], "points" );
	}
	#drawWave( wave, i ) {
		this.#drawWave2( wave.id, wave.dots, this.$elements.$gWaves, ( this.#waves.length - 1 - i ) * 2, wave.index );
	}
	#drawWave2( wId, dots, g, i, z ) {
		const curveDots = dots.map( dot => this.#getCoord( dot[ 0 ], dot[ 1 ], z ) );
		const isSel = this.#selectedWave === wId;

		GSUsetAttribute( g.children[ i ], "data-selected", isSel );
		GSUsetAttribute( g.children[ i ], "points", curveDots.join( " " ) );
		curveDots.shift();
		curveDots.pop();
		GSUsetAttribute( g.children[ i + 1 ], "data-selected", isSel );
		GSUsetAttribute( g.children[ i + 1 ], "points", curveDots.join( " " ) );
	}
	#drawInter( el, x ) {
		GSUsetAttribute( el, "points", this.#waves.map( ( wave, i ) => {
			const dotsI = x * ( wave.dots.length - 1 ) | 0;
			const dot = wave.dots[ dotsI ];

			return this.#getCoord( dot[ 0 ], dot[ 1 ], wave.index );
		} ).join( " " ) );
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
		const amp1 = this.#drawSz + this.#drawSz / 2 * ( 1 - camX2 );
		const amp2 = camX2 * this.#drawSz;
		const xAmp = camX <= .5 ? amp1 : amp2;
		const zAmp = camX <= .5 ? amp2 : amp1;

		return this.#w / 2 - this.#boxW / 2
			+ x * xAmp
			+ z * zAmp;
	}
	#calcY( x, y, z ) {
		const { camX, camY } = this.#perspective;
		const camY2 = this.#drawSz * -camY;
		const xAmp = camY2 * camX * -2;
		const yAmp = -( this.#drawSz * .7 )  * ( 1 - camY );
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
	}
	$onptrup( e ) {
		this.style.cursor = "grab";
	}
	$onptrmove( e ) {
		this.#setPerspective( {
			camX: GSUmathClamp( 0, 1, this.#perspective.camX - e.movementX / this.#drawSz / 2 ),
			camY: GSUmathClamp( 0, 1, this.#perspective.camY + e.movementY / this.#drawSz / 2 ),
		} );
		this.$draw();
	}
}

GSUdefineElement( "gsui-wavetable-graph", gsuiWavetableGraph );
