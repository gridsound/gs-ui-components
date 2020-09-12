"use strict";

class gsuiTrack extends HTMLElement {
	constructor() {
		const children = GSUI.getTemplate( "gsui-track" );

		super();
		this.rowElement = GSUI.getTemplate( "gsui-track-row" );
		this._children = children;
		this._inpName = children[ 1 ].firstChild;
		Object.seal( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.classList.add( "gsuiTrack" );
			this.append( ...this._children );
			this._children = null;
		}
	}
	static get observedAttributes() {
		return [ "toggle", "name", "order" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "toggle":
					this.classList.toggle( "gsui-mute", val === null );
					this.rowElement.classList.toggle( "gsui-mute", val === null );
					break;
				case "name":
					this._inpName.value = val;
					break;
				case "order":
					this.dataset.order = val;
					this._inpName.placeholder = `track ${ +val + 1 }`;
					break;
			}
		}
	}
}

customElements.define( "gsui-track", gsuiTrack );
