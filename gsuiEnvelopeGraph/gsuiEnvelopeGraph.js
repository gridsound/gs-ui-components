"use strict";

class gsuiEnvelopeGraph extends HTMLElement {
	#mainLine = GSUI.createElementSVG( "polyline", { class: "gsuiEnvelopeGraph-mainLine" } )
	#attLine = GSUI.createElementSVG( "polyline", { class: "gsuiEnvelopeGraph-line" } )
	#relLine = GSUI.createElementSVG( "polyline", { class: "gsuiEnvelopeGraph-line" } )
	#svg = GSUI.createElementSVG( "svg", { preserveAspectRatio: "none" },
		this.#mainLine, this.#attLine, this.#relLine )
	#width = 0
	#height = 0

	constructor() {
		super();
		this.attack = .25;
		this.hold = .25;
		this.decay = .25;
		this.sustain = .8;
		this.release = 1;
		this.duration = 4;
		Object.seal( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( this.#svg );
			this.resized();
		}
	}

	// .........................................................................
	resized() {
		const bcr = this.getBoundingClientRect(),
			w = ~~bcr.width,
			h = ~~bcr.height;

		this.#width = w;
		this.#height = h;
		GSUI.setAttribute( this.#svg, "viewBox", `0 0 ${ w } ${ h }` );
		this.draw();
	}
	draw() {
		if ( this.firstChild ) {
			const pts = gsuiEnvelopeGraph.#getPoints(
					this.#width, this.#height, this.duration,
					this.attack, this.hold, this.decay, this.sustain, this.release );

			GSUI.setAttribute( this.#attLine, "points", pts.slice( 0, 8 ).join( " " ) );
			GSUI.setAttribute( this.#relLine, "points", pts.slice( -4 ).join( " " ) );
			GSUI.setAttribute( this.#mainLine, "points", pts.join( " " ) );
		}
	}
	static #getPoints( w, h, dur, att, hold, dec, sus, rel ) {
		const dur2 = dur !== "auto" ? dur : att + hold + dec + 1 + rel,
			bpp = w / dur2,
			attX = bpp * att,
			holX = attX + bpp * hold,
			decX = holX + bpp * dec,
			susX = decX + bpp * ( dur === "auto" ? 1 : dur - att - hold - dec - rel ),
			relX = susX + bpp * rel,
			susY = h * ( 1 - sus );

		return [
			0,    h,
			attX, 2,
			holX, 2,
			decX, susY + 2,
			susX, susY + 2,
			relX, h,
		];
	}
}

Object.freeze( gsuiEnvelopeGraph );
customElements.define( "gsui-envelope-graph", gsuiEnvelopeGraph );
