"use strict";

class gsuiDotlineSVG extends gsui0ne {
	#w = 1;
	#h = 1;
	#xmin = 0;
	#ymin = 0;
	#xmax = 0;
	#ymax = 0;
	#svgW = 0;
	#svgH = 0;
	#resW = 500;

	constructor() {
		super( {
			$cmpName: "gsuiDotlineSVG",
			$tagName: "gsui-dotlinesvg",
			$elements: {
				$svg: "svg",
				$path: "path",
			},
		} );
		Object.seal( this );
	}

	// .........................................................................
	$setSVGSize( w, h ) {
		this.#svgW = w;
		this.#svgH = h;
		this.#resW = w * 2;
		GSUsetViewBoxWH( this.$elements.$svg, w, h );
	}
	$setDataBox( box ) {
		const n = box.split( " " );

		this.#xmin = +n[ 0 ];
		this.#ymin = +n[ 1 ];
		this.#xmax = +n[ 2 ];
		this.#ymax = +n[ 3 ];
		this.#w = this.#xmax - this.#xmin;
		this.#h = this.#ymax - this.#ymin;
	}
	$setCurve( data ) {
		const xy = GSUmathSampleDotLine( data, this.#resW );
		const curveDots = [];

		if ( xy.length > 1 ) {
			const xy0 = xy.shift();

			curveDots.push( "M", this.#calcX( xy0[ 0 ] ), this.#calcY( xy0[ 1 ] ) );
			xy.forEach( dot => curveDots.push( "L", this.#calcX( dot[ 0 ] ), this.#calcY( dot[ 1 ] ) ) );
		}
		GSUsetAttribute( this.$elements.$path, "d", curveDots.join( " " ) );
	}

	// .........................................................................
	#calcX( x ) {
		return GSUmathFix( ( x - this.#xmin ) / this.#w * this.#svgW, 5 );
	}
	#calcY( y ) {
		return GSUmathFix( this.#svgH - ( y - this.#ymin ) / this.#h * this.#svgH, 5 );
	}
}

GSUdefineElement( "gsui-dotlinesvg", gsuiDotlineSVG );
