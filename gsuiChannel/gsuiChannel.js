"use strict";

class gsuiChannel extends HTMLElement {
	#children = GSUI.$getTemplate( "gsui-channel" );
	#elements = GSUI.$findElements( this.#children, {
		nameWrap: ".gsuiChannel-nameWrap",
		name: ".gsuiChannel-name",
		analyser: "gsui-analyser",
		effects: ".gsuiChannel-effects",
		pan: ".gsuiChannel-pan gsui-slider",
		gain: ".gsuiChannel-gain gsui-slider",
		connecta: ".gsuiChannel-connectA",
		connectb: ".gsuiChannel-connectB",
	} );
	analyser = this.#elements.analyser;

	constructor() {
		super();
		Object.seal( this );

		this.#elements.nameWrap.onclick =
		this.#elements.analyser.onclick = () => {
			GSUI.$dispatchEvent( this, "gsuiChannel", "selectChannel" );
		};
		this.#elements.effects.onclick = e => {
			if ( e.target.dataset.id ) {
				GSUI.$dispatchEvent( this, "gsuiChannel", "selectChannel" );
				GSUI.$dispatchEvent( this, "gsuiChannel", "selectEffect", e.target.dataset.id );
			}
		};
		GSUI.$listenEvents( this, {
			gsuiSlider: {
				inputStart: GSUI.$noop,
				inputEnd: GSUI.$noop,
				input: ( d, sli ) => {
					GSUI.$dispatchEvent( this, "gsuiChannel", "liveChange", sli.dataset.prop, d.args[ 0 ] );
				},
				change: ( d, sli ) => {
					GSUI.$dispatchEvent( this, "gsuiChannel", "change", sli.dataset.prop, d.args[ 0 ] );
				},
			},
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUI.$setAttribute( this, "draggable", "true" );
			GSUI.$recallAttributes( this, {
				name: "chan",
				pan: 0,
				gain: 1,
				connecta: "down",
			} );
		}
	}
	static get observedAttributes() {
		return [ "name", "pan", "gain", "connecta", "connectb" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			switch ( prop ) {
				case "name":
					this.#elements.name.textContent = val;
					break;
				case "pan":
				case "gain":
					this.#elements[ prop ].setValue( val );
					break;
				case "connecta":
				case "connectb":
					this.#elements[ prop ].dataset.icon = val ? `caret-${ val }` : "";
					break;
			}
		}
	}

	// .........................................................................
	$addEffect( id, obj ) {
		this.#elements.effects.append( GSUI.$getTemplate( "gsui-channel-effect", id, obj.type ) );
	}
	$removeEffect( id ) {
		this.#getEffect( id ).remove();
	}
	$updateEffect( id, obj ) {
		if ( "order" in obj ) {
			this.#getEffect( id ).style.order = obj.order;
		}
		if ( "toggle" in obj ) {
			this.#getEffect( id ).classList.toggle( "gsuiChannel-effect-enable", obj.toggle );
		}
	}
	#getEffect( id ) {
		return this.#elements.effects.querySelector( `[data-id="${ id }"]` );
	}
}

Object.freeze( gsuiChannel );
customElements.define( "gsui-channel", gsuiChannel );
