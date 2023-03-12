"use strict";

class gsuiTrack extends HTMLElement {
	rowElement = GSUI.$getTemplate( "gsui-track-row" );
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiTrack" );
	#children = GSUI.$getTemplate( "gsui-track" );
	#inpName = this.#children[ 1 ].firstChild;

	constructor() {
		super();
		Object.seal( this );
		this.onchange = this.#onchange.bind( this );
		this.onkeydown = this.#onkeydown.bind( this );
		this.ondblclick = this.#ondblclick.bind( this );
		this.#inpName.onblur = this.#onblur.bind( this );
		GSUI.$listenEvents( this, {
			gsuiToggle: {
				toggle: d => {
					GSUI.$setAttribute( this, "mute", !d.args[ 0 ] );
					this.#dispatch( "toggle", d.args[ 0 ] );
				},
				toggleSolo: () => {
					GSUI.$setAttribute( this, "mute", false );
					this.#dispatch( "toggleSolo" );
				},
			},
		} );
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
					GSUI.$setAttribute( this.firstElementChild, "off", val !== null );
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

	// .........................................................................
	#ondblclick( e ) {
		if ( e.target === this.#inpName ) {
			this.#inpName.disabled = false;
			this.#inpName.select();
			this.#inpName.focus();
		}
	}
	#onkeydown( e ) {
		if ( e.target === this.#inpName ) {
			e.stopPropagation();
			switch ( e.key ) {
				case "Escape": this.#inpName.value = GSUI.$getAttribute( this, "name" );
				case "Enter": this.#inpName.blur();
			}
		}
	}
	#onchange() {
		const n = this.#inpName.value.trim();

		this.#inpName.disabled = true;
		GSUI.$setAttribute( this, "name", n );
		this.#dispatch( "rename", n );
	}
	#onblur() {
		this.#inpName.disabled = true;
	}
}

Object.freeze( gsuiTrack );
customElements.define( "gsui-track", gsuiTrack );
