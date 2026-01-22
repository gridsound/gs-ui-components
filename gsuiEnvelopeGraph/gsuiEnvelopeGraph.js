"use strict";

class gsuiEnvelopeGraph extends gsui0ne {
	$amp = 1;
	$attack = .25;
	$hold = .25;
	$decay = .25;
	$sustain = .8;
	$release = 1;
	$duration = 4;

	constructor() {
		super( {
			$cmpName: "gsuiEnvelopeGraph",
			$tagName: "gsui-envelope-graph",
			$jqueryfy: true,
			$elements: {
				$mainLine: ".gsuiEnvelopeGraph-mainLine",
				$attLine: ".gsuiEnvelopeGraph-line",
				$relLine: ".gsuiEnvelopeGraph-line + .gsuiEnvelopeGraph-line",
			},
		} );
		Object.seal( this );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.$resized();
	}

	// .........................................................................
	$resized() {
		this.$element.$viewbox( this.clientWidth, this.clientHeight );
		this.$draw();
	}
	$draw() {
		if ( this.firstChild ) {
			const pts = gsuiEnvelopeGraph.#getPoints(
				this.clientWidth, this.clientHeight, this.$duration,
				Math.abs( this.$amp ), this.$attack, this.$hold, this.$decay, this.$sustain, this.$release );

			this.$elements.$attLine.$attr( "points", pts.slice( 0, 8 ).join( " " ) );
			this.$elements.$relLine.$attr( "points", pts.slice( -4 ).join( " " ) );
			this.$elements.$mainLine.$attr( "points", pts.join( " " ) );
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
