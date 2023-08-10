"use strict";

class gsuiToggle extends HTMLElement {
	constructor() {
		super();
		Object.seal( this );
		this.oncontextmenu = () => false;
		this.onmousedown = e => {
			if ( e.button === 2 ) {
				GSUdispatchEvent( this, "gsuiToggle", "toggleSolo" );
			} else if ( e.button === 0 ) {
				const off = GSUgetAttribute( this, "off" ) !== null;

				GSUsetAttribute( this, "off", !off );
				GSUdispatchEvent( this, "gsuiToggle", "toggle", off );
			}
		};
	}

	// .........................................................................
	connectedCallback() {
		GSUsetAttribute( this, "tabindex", 0 );
	}
}

Object.freeze( gsuiToggle );
customElements.define( "gsui-toggle", gsuiToggle );
