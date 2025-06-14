"use strict";

class gsuiFxDelay extends gsui0ne {
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
					time: "[data-prop='time'] .gsuiEffect-param-value",
					gain: "[data-prop='gain'] .gsuiEffect-param-value",
					pan: "[data-prop='pan'] .gsuiEffect-param-value",
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
	static get observedAttributes() {
		return [ "timedivision", "time", "gain", "pan" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "timedivision":
				GSUdomSetAttr( this.$elements.$beatlines, "timedivision", val );
				this.#updatePxPerBeat();
				break;
			case "time":
			case "gain":
			case "pan": {
				const str =
					prop === "pan" ? GSUmathSign( Math.round( val * 100 ) ) :
					prop === "gain" ? Math.round( val * 100 ) :
					( +val ).toFixed( 2 );

				this.$elements.$values[ prop ].textContent = str;
				GSUdomSetAttr( this.$elements.$sliders[ prop ], "value", val );
				this.#updateGraph();
			} break;
		}
	}

	// .........................................................................
	$onresize() {
		this.#graphWidth = GSUdomBCRwh( this.$elements.$beatlines )[ 0 ];
		this.#updatePxPerBeat();
	}
	#updatePxPerBeat() {
		const bPM = GSUdomGetAttr( this, "timedivision" ).split( "/" )[ 0 ];

		GSUdomSetAttr( this.$elements.$beatlines, "pxperbeat", this.#graphWidth / bPM );
	}
	#oninputProp( prop, val ) {
		GSUdomSetAttr( this, prop, val );
		this.$dispatch( "liveChange", prop, val );
	}
	#updateGraph() {
		const time = GSUdomGetAttrNum( this, "time" ) / 4;
		const gain = GSUdomGetAttrNum( this, "gain" );
		const pan = GSUdomGetAttrNum( this, "pan" );

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

GSUdefineElement( "gsui-fx-delay", gsuiFxDelay );
