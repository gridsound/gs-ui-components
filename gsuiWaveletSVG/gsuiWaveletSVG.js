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
			$attributes: {
				hz: 1,
				amp: 1,
			},
		} );
		Object.seal( this );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "resolution", "axes" ]; // + "amp", "hz"
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
	$onmessage( ev, arr ) {
		if ( ev === GSEV_WAVELETSVG_DRAW ) {
			this.#draw( arr );
		}
	}

	// .........................................................................
	#res( wh ) {
		const [ w, h ] = GSUsplitInts( wh );
		const pad = parseFloat( this.$this.$css( "--gsuiWaveletSVG-pad" ) || 0 );

		this.#w = w - pad;
		this.#h = h - pad;
		if ( this.#w > 0 && this.#h > 0 ) {
			this.$element.$viewbox( this.#w, this.#h );
		}
	}
	#draw( arr ) {
		const [ hz, amp ] = this.$this.$getAttr( "hz", "amp" );

		gsuiWaveletSVG.#draw2( this.$element.$children(), this.#w, this.#h, arr, +hz, +amp );
	}
	static #draw2( elems, w, h, arr, hz, amp ) {
		if ( w > 0 && h > 0 && arr?.length >= 1 ) {
			const attrs = [];
			const len = arr.length;
			const len1 = len - 1;
			const nbPts = GSUmathClamp( len * hz, 2, w );
			const nbPts1 = nbPts - 1;
			const pts = GSUnewArray( nbPts, i => [
				i / nbPts1 * w,
				( .5 - arr[ Math.min( len1, Math.round( i / nbPts1 * len1 * hz % len ) ) ] / 2 * amp ) * h,
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
