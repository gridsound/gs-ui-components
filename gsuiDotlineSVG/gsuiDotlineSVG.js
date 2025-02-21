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
		GSUsetAttribute( this.$elements.$path, "d",
			Object.entries( data )
				.sort( ( a, b ) => a[ 1 ].x - b[ 1 ].x )
				.reduce( this.#setCurveDot.bind( this ), [] )
				.join( " " )
		);
	}
	#setCurveDot( arr, [ , dot ], i ) {
		arr.push(
			!i ? "M" : "L",
			GSUroundNum( ( dot.x - this.#xmin ) / this.#w * this.#svgW, 5 ),
			GSUroundNum( this.#svgH - ( dot.y - this.#ymin ) / this.#h * this.#svgH, 5 ),
		);
		return arr;
	}
}

GSUdefineElement( "gsui-dotlinesvg", gsuiDotlineSVG );
