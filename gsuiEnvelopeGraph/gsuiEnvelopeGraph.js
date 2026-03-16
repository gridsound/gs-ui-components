"use strict";

class gsuiEnvelopeGraph extends gsui0ne {
	#data = Object.seal( {
		$amp: 1,
		$attack: .25,
		$hold: .25,
		$decay: .25,
		$sustain: .8,
		$release: 1,
		$duration: 4,
	} );

	constructor() {
		super( {
			$tagName: "gsui-envelope-graph",
			$elements: {
				$lines: "polyline",
			},
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.#resized();
	}
	$onmessage( ev ) {
		switch ( ev ) {
			case GSEV_ENVELOPEGRAPH_DATA: return this.#data;
			case GSEV_ENVELOPEGRAPH_DRAW: this.#draw(); break;
			case GSEV_ENVELOPEGRAPH_RESIZE: this.#resized(); break;
		}
	}

	// .........................................................................
	#resized() {
		this.$element.$viewbox( this.$this.$width(), this.$this.$height() );
		this.#draw();
	}
	#draw() {
		if ( this.firstChild ) {
			const d = this.#data;
			const pts = gsuiEnvelopeGraph.#getPoints(
				this.$this.$width(), this.$this.$height(), d.$duration,
				Math.abs( d.$amp ), d.$attack, d.$hold, d.$decay, d.$sustain, d.$release );
			const ptsArr = [
				pts.join( " " ),
				pts.slice( 0, 8 ).join( " " ),
				pts.slice( -4 ).join( " " ),
			];

			this.$elements.$lines.$setAttr( "points", ( _, i ) => ptsArr[ i ] );
		}
	}
	static #getPoints( w, h, dur, amp, att, hold, dec, sus, rel ) {
		const dur2 = dur !== "auto" ? dur : att + hold + dec + 1 + rel;
		const bpp = w / dur2;
		const attX = bpp * att;
		const holX = attX + bpp * hold;
		const decX = holX + bpp * dec;
		const susX = decX + bpp * ( dur === "auto" ? 1 : dur - att - hold - dec - rel );
		const relX = susX + bpp * rel;
		const holY = h - ( h * amp );
		const susY = h - ( h * amp * sus );

		return [ 0, h, attX, holY, holX, holY, decX, susY, susX, susY, relX, h ];
	}
}

GSUdomDefine( "gsui-envelope-graph", gsuiEnvelopeGraph );
