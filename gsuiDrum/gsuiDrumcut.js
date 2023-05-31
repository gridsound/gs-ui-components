"use strict";

class gsuiDrumcut extends HTMLElement {
	#children = GSUI.$getTemplate( "gsui-drumcut" );

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
		return [ "when" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "when":
					this.style.left = `${ val }em`;
					break;
			}
		}
	}
}

Object.freeze( gsuiDrumcut );
customElements.define( "gsui-drumcut", gsuiDrumcut );
