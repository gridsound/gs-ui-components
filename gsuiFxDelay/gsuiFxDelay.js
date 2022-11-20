"use strict";

class gsuiFxDelay extends HTMLElement {
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiFxDelay" );
	#children = GSUI.$getTemplate( "gsui-fx-delay" );
	#elements = GSUI.$findElements( this.#children, {
		sliders: {
			time: "[data-prop='time'] gsui-slider",
			gain: "[data-prop='gain'] gsui-slider",
			pan: "[data-prop='pan'] gsui-slider",
		},
		values: {
			time: "[data-prop='time'] .gsuiFxDelay-param-value",
			gain: "[data-prop='gain'] .gsuiFxDelay-param-value",
			pan: "[data-prop='pan'] .gsuiFxDelay-param-value",
		},
	} );

	constructor() {
		super();
		Object.seal( this );

		GSUI.$listenEvents( this, {
			gsuiSlider: {
				inputStart: GSUI.$noop,
				inputEnd: GSUI.$noop,
				input: ( d, sli ) => {
					this.#oninputProp( sli.parentNode.dataset.prop, d.args[ 0 ] );
				},
				change: ( d, sli ) => {
					this.#dispatch( "changeProp", sli.parentNode.dataset.prop, d.args[ 0 ] );
				},
			},
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUI.$recallAttributes( this, {
				time: .25,
				gain: .2,
				pan: 0,
			} );
		}
	}
	static get observedAttributes() {
		return [ "time", "gain", "pan" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "time":
				case "gain":
				case "pan":
					this.#elements.sliders[ prop ].setValue( +val );
					this.#elements.values[ prop ].textContent = ( +val ).toFixed( 2 );
					break;
			}
		}
	}

	// .........................................................................
	toggle( b ) {
		this.classList.toggle( "gsuiFxDelay-enable", b );
	}

	// .........................................................................
	#oninputProp( prop, val ) {
		this.#elements.values[ prop ].textContent = val.toFixed( 2 );
		this.#dispatch( "liveChange", prop, val );
	}
}

Object.freeze( gsuiFxDelay );
customElements.define( "gsui-fx-delay", gsuiFxDelay );

if ( typeof gsuiEffects !== "undefined" ) {
	gsuiEffects.fxsMap.set( "delay", { cmp: gsuiFxDelay, name: "Delay", height: 80 } );
}
