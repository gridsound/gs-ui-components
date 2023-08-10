"use strict";

class gsuiDrum extends HTMLElement {
	#children = GSUgetTemplate( "gsui-drum" );

	constructor() {
		super();
		Object.seal( this );
	}

	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( this.#children );
			this.#children = null;
		}
	}
	static get observedAttributes() {
		return [ "when", "duration", "gain", "pan", "detune" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "when":
					this.style.left = `${ val }em`;
					break;
				case "duration":
					this.style.width = `${ val }em`;
					break;
				case "pan":
				case "gain":
				case "detune":
					this.#changeProp( prop, val );
					break;
			}
		}
	}

	// .........................................................................
	#changeProp( prop, val ) {
		const sel = `.gsuiDrum-prop[data-value="${ prop }"] .gsuiDrum-propValue`;
		const st = this.querySelector( sel ).style;

		switch ( prop ) {
			case "detune":
				st.left = val > 0 ? "50%" : `${ ( 1 + val / 12 ) * 50 }%`;
				st.width = `${ Math.abs( val / 12 ) * 50 }%`;
				break;
			case "pan":
				st.left = val > 0 ? "50%" : `${ ( 1 + val ) * 50 }%`;
				st.width = `${ Math.abs( val ) * 50 }%`;
				break;
			case "gain":
				st.left = 0;
				st.width = `${ val * 100 }%`;
				break;
		}
	}
}

Object.freeze( gsuiDrum );
customElements.define( "gsui-drum", gsuiDrum );
