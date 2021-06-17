"use strict";

class gsuiSlicer extends HTMLElement {
	#onresizeBind = this.#onresize.bind( this )
	#children = GSUI.getTemplate( "gsui-slicer" )
	#elements = GSUI.findElements( this.#children, {
	} )

	constructor() {
		super();
		Object.seal( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.classList.add( "gsuiSlicer" );
			this.append( ...this.#children );
			this.#children = null;
			// GSUI.recallAttributes( this, {
			// } );
		}
		GSUI.observeSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		GSUI.unobserveSizeOf( this, this.#onresizeBind );
	}
	static get observedAttributes() {
		return [ "timedivision" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			const num = +val;

			switch ( prop ) {
				// case "timedivision": this.#elements.beatlines.setAttribute( "timedivision", val ); break;
			}
		}
	}

	// .........................................................................
	#updatePxPerBeat() {
		// this.#elements.beatlines.setAttribute( "pxPerBeat", this.#waveWidth / this.#dur );
	}

	// .........................................................................
	#onresize() {
		// this.#waveWidth = this.#elements.beatlines.getBoundingClientRect().width;
		this.#updatePxPerBeat();
	}
}

customElements.define( "gsui-slicer", gsuiSlicer );

Object.freeze( gsuiSlicer );
