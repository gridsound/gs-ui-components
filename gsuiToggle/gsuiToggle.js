"use strict";

class gsuiToggle extends HTMLElement {
	constructor() {
		super();
		Object.seal( this );
		this.onclick = () => {
			const off = GSUI.$getAttribute( this, "off" ) !== null;

			GSUI.$dispatchEvent( this, "gsuiToggle", "toggle", off );
			GSUI.$setAttribute( this, "off", !off );
		};
	}
}

Object.freeze( gsuiToggle );
customElements.define( "gsui-toggle", gsuiToggle );
