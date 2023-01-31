"use strict";

class gsuiMixer extends HTMLElement {
	#children = GSUI.$getTemplate( "gsui-mixer" );
	#elements = GSUI.$findElements( this.#children, {
		channels: "gsui-channels",
	} );
	channels = this.#elements.channels;

	constructor() {
		super();
		this.channels.oninput = lg;
		this.channels.onchange = lg;
		this.channels.onselectChan = lg;
		Object.seal( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( this.#children );
			this.#children = null;
			// GSUI.$recallAttributes( this, {
			// } );
		}
	}
}

Object.freeze( gsuiMixer );
customElements.define( "gsui-mixer", gsuiMixer );
