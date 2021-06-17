"use strict";

class gsuiSlicer extends HTMLElement {
	#dur = 4
	#slicesWidth = 100
	#onresizeBind = this.#onresize.bind( this )
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiSlicer" )
	#children = GSUI.getTemplate( "gsui-slicer" )
	#elements = GSUI.findElements( this.#children, {
		beatlines: "gsui-beatlines",
		diagonalLine: ".gsuiSlicer-slices-line",
		inputDuration: ".gsuiSlicer-duration-input",
	} )

	constructor() {
		super();
		Object.seal( this );

		this.#elements.inputDuration.onchange = this.#onchangeDuration.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.classList.add( "gsuiSlicer" );
			this.append( ...this.#children );
			this.#children = null;
			GSUI.recallAttributes( this, {
				duration: 4,
				timedivision: "4/4",
			} );
		}
		GSUI.observeSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		GSUI.unobserveSizeOf( this, this.#onresizeBind );
	}
	static get observedAttributes() {
		return [ "duration", "timedivision" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			switch ( prop ) {
				case "timedivision": this.#elements.beatlines.setAttribute( "timedivision", val ); break;
				case "duration":
					this.#elements.inputDuration.value =
					this.#dur = +val;
					this.#updatePxPerBeat();
					break;
			}
		}
	}

	// .........................................................................
	#updatePxPerBeat( dur ) {
		this.#elements.beatlines.setAttribute( "pxperbeat", this.#slicesWidth / ( dur || this.#dur ) );
	}

	// .........................................................................
	#onresize() {
		const svg = this.#elements.diagonalLine,
			{ width: w, height: h } = svg.getBoundingClientRect();

		this.#slicesWidth = w;
		GSUI.setAttribute( svg, "viewBox", `0 0 ${ w } ${ h }` );
		GSUI.setAttribute( svg.firstChild, "x2", w );
		GSUI.setAttribute( svg.firstChild, "y2", h );
		this.#updatePxPerBeat();
	}
	#onchangeDuration( e ) {
		const dur = +e.target.value;

		GSUI.setAttribute( this, "duration", dur );
		this.#dispatch( "changeDuration", dur );
	}
}

customElements.define( "gsui-slicer", gsuiSlicer );

Object.freeze( gsuiSlicer );
