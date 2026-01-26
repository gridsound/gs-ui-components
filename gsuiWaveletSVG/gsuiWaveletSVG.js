"use strict";

class gsuiWaveletSVG extends gsui0ne {
	#w = 0;
	#h = 0;

	constructor() {
		super( {
			$cmpName: "gsuiWaveletSVG",
			$tagName: "gsui-wavelet-svg",
			$template: GSUcreateElement( "svg", { preserveAspectRatio: "none", inert: true },
				GSUcreateElement( "polyline" ),
				GSUcreateElement( "line" ),
				GSUcreateElement( "line" ),
			),
		} );
		Object.seal( this );
	}

	// .........................................................................
	$resolution() {
		this.$element.$viewbox(
			this.#w = this.$element.$width(),
			this.#h = this.$element.$height(),
		);
	}
	$draw( arr ) {
		const w = this.#w;
		const h = this.#h;

		if ( w && h && arr?.length >= 1 ) {
			// const arr2 = GSUarrayResize( arr, w );
			const len = arr.length - 1;
			const pts = GSUnewArray( len + 1, i => [
				i / len * w,
				( .5 - arr[ i ] / 2 ) * h,
			] );

			pts.unshift(
				[ -10, h / 2 ],
				[ -10, pts[ 0 ][ 1 ] ],
			);
			pts.push(
				[ w + 10, pts.at( -1 )[ 1 ] ],
				[ w + 10, h / 2 ],
			);
			this.$element.$child( 0 ).$setAttr( "points", pts.join( " " ) );
			this.$element.$child( 1 ).$setAttr( { x1: 0, y1: h / 2, x2: w, y2: h / 2 } );
			this.$element.$child( 2 ).$setAttr( { x1: w / 2, y1: 0, x2: w / 2, y2: h } );
		}
	}
}

GSUdomDefine( "gsui-wavelet-svg", gsuiWaveletSVG );
