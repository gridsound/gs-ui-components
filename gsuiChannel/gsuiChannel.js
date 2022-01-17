"use strict";

class gsuiChannel extends HTMLElement {
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiChannel" )
	#children = GSUI.getTemplate( "gsui-channel" )
	#elements = GSUI.findElements( this.#children, {
		name: ".gsuiChannel-name",
		analyser: "gsui-analyser",
		pan: ".gsuiChannel-pan gsui-slider",
		gain: ".gsuiChannel-gain gsui-slider",
		connecta: ".gsuiChannel-connectA",
		connectb: ".gsuiChannel-connectB",
	} )
	analyser = this.#elements.analyser

	constructor() {
		super();
		Object.seal( this );

		GSUI.listenEvents( this, {
			gsuiSlider: {
				inputStart: GSUI.noop,
				inputEnd: GSUI.noop,
				input: ( d, sli ) => {
					this.#dispatch( "liveChange", sli.dataset.prop, d.args[ 0 ] );
				},
				change: ( d, sli ) => {
					this.#dispatch( "change", sli.dataset.prop, d.args[ 0 ] );
				},
			},
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUI.setAttribute( this, "draggable", "true" );
			GSUI.recallAttributes( this, {
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
}

Object.freeze( gsuiChannel );
customElements.define( "gsui-channel", gsuiChannel );
