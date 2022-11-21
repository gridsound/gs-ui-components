"use strict";

class gsuiFxDelay extends HTMLElement {
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiFxDelay" );
	#onresizeBind = this.#onresize.bind( this );
	#children = GSUI.$getTemplate( "gsui-fx-delay" );
	#graphWidth = 0;
	#elements = GSUI.$findElements( this.#children, {
		beatlines: "gsui-beatlines",
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
	#nlDots = this.getElementsByClassName( "gsuiFxDelay-graph-echo" );

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
				gain: .7,
				pan: -.2,
			} );
			this.#updateGraph();
		}
		GSUI.$observeSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		GSUI.$unobserveSizeOf( this, this.#onresizeBind );
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
					this.#updateGraph();
					break;
			}
		}
	}

	// .........................................................................
	toggle( b ) {
		this.classList.toggle( "gsuiFxDelay-enable", b );
	}

	// .........................................................................
	#onresize() {
		this.#graphWidth = this.#elements.beatlines.getBoundingClientRect().width;
		this.#updatePxPerBeat();
	}
	#updatePxPerBeat() {
		GSUI.$setAttribute( this.#elements.beatlines, "pxperbeat", this.#graphWidth / 4 );
	}
	#oninputProp( prop, val ) {
		GSUI.$setAttribute( this, prop, val );
		this.#dispatch( "liveChange", prop, val );
	}
	#updateGraph() {
		const time = GSUI.$getAttributeNum( this, "time" ) / 4;
		const gain = GSUI.$getAttributeNum( this, "gain" );
		const pan = GSUI.$getAttributeNum( this, "pan" );

		Array.from( this.#nlDots ).forEach( ( dot, i ) => {
			const opa = gain ** ( i + 1 );
			const j = i + 1;
			const top = i % 2 !== 0
				? Math.min( Math.max( pan * j, -1 ), 1 )
				: Math.min( Math.max( -pan * j, -1 ), 1 );

			dot.style.display = opa > .01 ? "block" : "none";
			dot.style.opacity = opa;
			dot.style.left = `${ j * time * 100 }%`;
			dot.style.top = `${ ( top / 2 + .5 ) * 100 }%`;
		} );
	}
}

Object.freeze( gsuiFxDelay );
customElements.define( "gsui-fx-delay", gsuiFxDelay );

if ( typeof gsuiEffects !== "undefined" ) {
	gsuiEffects.fxsMap.set( "delay", { cmp: gsuiFxDelay, name: "Delay", height: 140 } );
}
