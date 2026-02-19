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
			),
		} );
		Object.seal( this );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "resolution", "axes" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "resolution": this.#res( val ); break;
			case "axes":
				val !== ""
					? this.$element.$query( "line" ).$remove()
					: this.$element.$children().$size() === 1 && // because of GSUdomRecallAttributes
						this.$element.$append( GSUcreateElement( "line" ), GSUcreateElement( "line" ) )
				break;
		}
	}
	$onmessage( ev, arr, withResize ) {
		switch ( ev ) {
			case GSEV_WAVELETSVG_DRAW:
				gsuiWaveletSVG.#draw( this.$element.$children(), this.#w, this.#h, arr, withResize );
				break;
		}
	}

	// .........................................................................
	#res( wh ) {
		const [ w, h ] = GSUsplitInts( wh );
		const pad = parseFloat( this.$this.$css( "--gsuiWaveletSVG-pad" ) || 0 );

		this.#w = w - pad;
		this.#h = h - pad;
		this.$element.$viewbox( this.#w, this.#h );
	}
	static #draw( elems, w, h, arr, withResize ) {
		if ( w && h && arr?.length >= 1 ) {
			const attrs = [];
			const arr2 = withResize ? GSUarrayResize( arr, w ) : arr;
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
			attrs.push( { points: pts.join( " " ) } );
			if ( elems.$size() > 1 ) {
				attrs.push(
					{ x1: 0, y1: h / 2, x2: w, y2: h / 2 },
					{ x1: w / 2, y1: 0, x2: w / 2, y2: h }
				);
			}
			elems.$setAttr( ( _, i ) => attrs[ i ] );
		}
	}
}

GSUdomDefine( "gsui-wavelet-svg", gsuiWaveletSVG );
