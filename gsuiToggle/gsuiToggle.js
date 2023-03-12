"use strict";

class gsuiToggle extends HTMLElement {
	constructor() {
		super();
		Object.seal( this );
		this.oncontextmenu = () => false;
		this.onmousedown = e => {
			if ( e.button === 2 ) {
				GSUI.$dispatchEvent( this, "gsuiToggle", "toggleSolo" );
			} else if ( e.button === 0 ) {
				const off = GSUI.$getAttribute( this, "off" ) !== null;

				GSUI.$setAttribute( this, "off", !off );
				GSUI.$dispatchEvent( this, "gsuiToggle", "toggle", off );
			}
		};
	}

	// .........................................................................
	connectedCallback() {
		GSUI.$setAttribute( this, "tabindex", 0 );
	}
}

Object.freeze( gsuiToggle );
customElements.define( "gsui-toggle", gsuiToggle );
