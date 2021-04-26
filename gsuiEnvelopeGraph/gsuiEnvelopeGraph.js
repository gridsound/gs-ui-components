"use strict";

class gsuiEnvelopeGraph extends HTMLElement {
	#mainLine = GSUI.createElementNS( "polyline", { class: "gsuiEnvelopeGraph-mainLine" } )
	#attLine = GSUI.createElementNS( "polyline", { class: "gsuiEnvelopeGraph-line" } )
	#relLine = GSUI.createElementNS( "polyline", { class: "gsuiEnvelopeGraph-line" } )
	#svg = GSUI.createElementNS( "svg", { preserveAspectRatio: "none" },
		this.#mainLine, this.#attLine, this.#relLine )
	#width = 0
	#height = 0

	constructor() {
		super();
		this.attack = .25;
		this.hold = .25;
		this.decay = .25;
		this.substain = .8;
		this.release = 1;
		this.duration = 4;
		Object.seal( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.classList.add( "gsuiEnvelopeGraph" );
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
		this.#svg.setAttribute( "viewBox", `0 0 ${ w } ${ h }` );
		this.draw();
	}
	draw() {
		if ( this.firstChild ) {
			const pts = gsuiEnvelopeGraph.#getPoints(
					this.#width, this.#height, this.duration,
					this.attack, this.hold, this.decay, this.substain, this.release );

			this.#attLine.setAttribute( "points", pts.slice( 0, 8 ).join( " " ) );
			this.#relLine.setAttribute( "points", pts.slice( -4 ).join( " " ) );
			this.#mainLine.setAttribute( "points", pts.join( " " ) );
		}
	}
	static #getPoints( w, h, dur, att, hold, dec, sub, rel ) {
		const dur2 = dur !== "auto" ? dur : att + hold + dec + 1 + rel,
			bpp = w / dur2,
			attX = bpp * att,
			holX = attX + bpp * hold,
			decX = holX + bpp * dec,
			subX = decX + bpp * ( dur === "auto" ? 1 : dur - att - hold - dec - rel ),
			relX = subX + bpp * rel,
			subY = h * ( 1 - sub );

		return [
			0,    h,
			attX, 2,
			holX, 2,
			decX, subY + 2,
			subX, subY + 2,
			relX, h,
		];
	}
}

customElements.define( "gsui-envelopegraph", gsuiEnvelopeGraph );

Object.freeze( gsuiEnvelopeGraph );
