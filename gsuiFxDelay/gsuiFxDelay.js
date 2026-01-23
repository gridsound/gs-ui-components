"use strict";

class gsuiFxDelay extends gsui0ne {
	#graphWidth = 0;

	constructor() {
		super( {
			$cmpName: "gsuiFxDelay",
			$tagName: "gsui-fx-delay",
			$jqueryfy: true,
			$elements: {
				$beatlines: "gsui-beatlines",
				$sliders: "gsui-slider",
				$outputs: "gs-output",
				$dots: ".gsuiFxDelay-graph-echo",
			},
			$attributes: {
				timedivision: "4/4",
				time: .25,
				gain: .7,
				pan: -.2,
			},
		} );
		Object.seal( this );
		GSUdomListen( this, {
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( d, val ) => this.#oninputProp( d.$target.parentNode.dataset.prop, val ),
			[ GSEV_SLIDER_CHANGE ]: ( d, val ) => this.$this.$dispatch( GSEV_EFFECT_FX_CHANGEPROP, d.$target.parentNode.dataset.prop, val ),
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
				this.$elements.$beatlines.$setAttr( "timedivision", val );
				this.#updatePxPerBeat();
				break;
			case "time":
			case "gain":
			case "pan": {
				const str =
					prop === "pan" ? GSUmathSign( Math.round( val * 100 ) ) :
					prop === "gain" ? Math.round( val * 100 ) :
					( +val ).toFixed( 2 );

				this.$elements.$outputs.$filter( `[data-prop="${ prop }"] *` ).$text( str );
				this.$elements.$sliders.$filter( `[data-prop="${ prop }"] *` ).$setAttr( "value", val );
				this.#updateGraph();
			} break;
		}
	}

	// .........................................................................
	$onresize() {
		this.#graphWidth = GSUdomBCRwh( this.$elements.$beatlines.$get( 0 ) )[ 0 ];
		this.#updatePxPerBeat();
	}

	// .........................................................................
	#updatePxPerBeat() {
		const bPM = this.$this.$getAttr( "timedivision" ).split( "/" )[ 0 ];

		this.$elements.$beatlines.$setAttr( "pxperbeat", this.#graphWidth / bPM );
	}
	#oninputProp( prop, val ) {
		this.$this.$setAttr( prop, val )
			.$dispatch( GSEV_EFFECT_FX_LIVECHANGE, prop, val );
	}
	#updateGraph() {
		const [ time, gain, pan ] = this.$this.$getAttr( "time", "gain", "pan" );

		this.$elements.$dots.$each( ( dot, i ) => {
			const j = i + 1;
			const opa = gain ** j;
			const top = i % 2 === 0 ? -pan : +pan;

			dot.style.display = opa > .01 ? "block" : "none";
			dot.style.opacity = opa;
			dot.style.left = `${ j * time / 4 * 100 }%`;
			dot.style.top = `${ ( top / 2 + .5 ) * 100 }%`;
		} );
	}
}

GSUdomDefine( "gsui-fx-delay", gsuiFxDelay );
