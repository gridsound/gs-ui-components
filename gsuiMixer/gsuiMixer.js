"use strict";

class gsuiMixer extends HTMLElement {
	#children = GSUI.$getTemplate( "gsui-mixer" );
	#elements = GSUI.$findElements( this.#children, {
		channels: "gsui-channels",
		effects: "gsui-effects",
	} );

	constructor() {
		super();
		Object.seal( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( this.#children );
			this.#children = null;
			new gsuiScrollShadow( {
				scrolledElem: this.querySelector( ".gsuiChannels-panChannels" ),
				leftShadow: this.querySelector( ".gsuiChannels-panMain" ),
				rightShadow: this.querySelector( ".gsuiMixer-effects" ),
			} );
			new gsuiScrollShadow( {
				scrolledElem: this.#elements.effects,
				topShadow: this.querySelector( ".gsuiMixer-effects .gsuiMixer-head" ),
			} );
		}
	}

	// .........................................................................
	getChannels() {
		return this.#elements.channels;
	}
	getEffects() {
		return this.#elements.effects;
	}
}

Object.freeze( gsuiMixer );
customElements.define( "gsui-mixer", gsuiMixer );
