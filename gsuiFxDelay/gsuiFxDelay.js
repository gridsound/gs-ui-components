"use strict";

class gsuiFxDelay extends gsui0ne {
	#onresizeBind = this.#onresize.bind( this );
	#graphWidth = 0;
	#nlDots = this.getElementsByClassName( "gsuiFxDelay-graph-echo" );

	constructor() {
		super( {
			$cmpName: "gsuiFxDelay",
			$tagName: "gsui-fx-delay",
			$elements: {
				$beatlines: "gsui-beatlines",
				$sliders: {
					time: "[data-prop='time'] gsui-slider",
					gain: "[data-prop='gain'] gsui-slider",
					pan: "[data-prop='pan'] gsui-slider",
				},
				$values: {
					time: "[data-prop='time'] .gsuiFxDelay-param-value",
					gain: "[data-prop='gain'] .gsuiFxDelay-param-value",
					pan: "[data-prop='pan'] .gsuiFxDelay-param-value",
				},
			},
			$attributes: {
				timedivision: "4/4",
				time: .25,
				gain: .7,
				pan: -.2,
			},
		} );
		Object.seal( this );

		GSUlistenEvents( this, {
			gsuiSlider: {
				inputStart: GSUnoop,
				inputEnd: GSUnoop,
				input: ( d, sli ) => {
					this.#oninputProp( sli.parentNode.dataset.prop, d.args[ 0 ] );
				},
				change: ( d, sli ) => {
					this.$dispatch( "changeProp", sli.parentNode.dataset.prop, d.args[ 0 ] );
				},
			},
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.#updatePxPerBeat();
		this.#updateGraph();
	}
	$connected() {
		GSUobserveSizeOf( this, this.#onresizeBind );
	}
	$disconnected() {
		GSUunobserveSizeOf( this, this.#onresizeBind );
	}
	static get observedAttributes() {
		return [ "timedivision", "time", "gain", "pan" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "timedivision":
				GSUsetAttribute( this.$elements.$beatlines, "timedivision", val );
				this.#updatePxPerBeat();
				break;
			case "time":
			case "gain":
			case "pan":
				this.$elements.$sliders[ prop ].$setValue( +val );
				this.$elements.$values[ prop ].textContent = ( +val ).toFixed( 2 );
				this.#updateGraph();
				break;
		}
	}

	// .........................................................................
	$toggle( b ) {
		this.classList.toggle( "gsuiFxDelay-enable", b );
	}

	// .........................................................................
	#onresize() {
		this.#graphWidth = this.$elements.$beatlines.getBoundingClientRect().width;
		this.#updatePxPerBeat();
	}
	#updatePxPerBeat() {
		const bPM = GSUgetAttribute( this, "timedivision" ).split( "/" )[ 0 ];

		GSUsetAttribute( this.$elements.$beatlines, "pxperbeat", this.#graphWidth / bPM );
	}
	#oninputProp( prop, val ) {
		GSUsetAttribute( this, prop, val );
		this.$dispatch( "liveChange", prop, val );
	}
	#updateGraph() {
		const time = GSUgetAttributeNum( this, "time" ) / 4;
		const gain = GSUgetAttributeNum( this, "gain" );
		const pan = GSUgetAttributeNum( this, "pan" );

		Array.from( this.#nlDots ).forEach( ( dot, i ) => {
			const j = i + 1;
			const opa = gain ** j;
			const top = i % 2 === 0 ? -pan : pan;

			dot.style.display = opa > .01 ? "block" : "none";
			dot.style.opacity = opa;
			dot.style.left = `${ j * time * 100 }%`;
			dot.style.top = `${ ( top / 2 + .5 ) * 100 }%`;
		} );
	}
}

Object.freeze( gsuiFxDelay );
customElements.define( "gsui-fx-delay", gsuiFxDelay );
