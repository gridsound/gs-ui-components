"use strict";

class gsuiTrack extends HTMLElement {
	rowElement = GSUgetTemplate( "gsui-track-row" );
	#dispatch = GSUdispatchEvent.bind( null, this, "gsuiTrack" );
	#children = GSUgetTemplate( "gsui-track" );
	#inpName = this.#children[ 1 ].firstChild;

	constructor() {
		super();
		Object.seal( this );
		this.onchange = this.#onchange.bind( this );
		this.onkeydown = this.#onkeydown.bind( this );
		this.ondblclick = this.#ondblclick.bind( this );
		this.#inpName.onblur = this.#onblur.bind( this );
		GSUlistenEvents( this, {
			gsuiToggle: {
				toggle: d => {
					GSUsetAttribute( this, "mute", !d.args[ 0 ] );
					this.#dispatch( "toggle", d.args[ 0 ] );
				},
				toggleSolo: () => {
					GSUsetAttribute( this, "mute", false );
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
			GSUrecallAttributes( this, {
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
					GSUsetAttribute( this.firstElementChild, "off", val !== null );
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
		if ( e.target.classList.contains( "gsuiTrack-nameWrap" ) ) {
			this.#inpName.disabled = false;
			this.#inpName.select();
			this.#inpName.focus();
		}
	}
	#onkeydown( e ) {
		if ( e.target === this.#inpName ) {
			e.stopPropagation();
			switch ( e.key ) {
				case "Escape": this.#inpName.value = GSUgetAttribute( this, "name" );
				case "Enter": this.#inpName.blur();
			}
		}
	}
	#onchange() {
		const n = this.#inpName.value.trim();

		this.#inpName.disabled = true;
		GSUsetAttribute( this, "name", n );
		this.#dispatch( "rename", n );
	}
	#onblur() {
		this.#inpName.disabled = true;
	}
}

Object.freeze( gsuiTrack );
customElements.define( "gsui-track", gsuiTrack );
