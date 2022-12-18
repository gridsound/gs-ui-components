"use strict";

class gsuiTrack extends HTMLElement {
	rowElement = GSUI.$getTemplate( "gsui-track-row" );
	#children = GSUI.$getTemplate( "gsui-track" );
	#inpName = this.#children[ 1 ].firstChild;

	constructor() {
		super();
		Object.seal( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUI.$recallAttributes( this, {
				name: "",
				order: 0,
			} );
		}
	}
	static get observedAttributes() {
		return [ "mute", "name", "order" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "mute":
					this.rowElement.classList.toggle( "gsui-mute", val !== null );
					break;
				case "name":
					this.#inpName.value = val;
					break;
				case "order":
					this.dataset.order = val;
					this.#inpName.placeholder = `track ${ +val + 1 }`;
					break;
			}
		}
	}
}

Object.freeze( gsuiTrack );
customElements.define( "gsui-track", gsuiTrack );
