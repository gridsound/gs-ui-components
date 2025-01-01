"use strict";

class gsuiEnvelope extends gsui0ne {
	#type = "gain";
	#dur = 4;
	#waveWidth = 300;

	constructor() {
		super( {
			$cmpName: "gsuiEnvelope",
			$tagName: "gsui-envelope",
			$elements: {
				$beatlines: "gsui-beatlines",
				$graph: "gsui-envelope-graph",
				$sliders: {
					amp:     [ ".gsuiEnvelope-prop[data-prop='amp']     gsui-slider", ".gsuiEnvelope-prop[data-prop='amp']     .gsuiEnvelope-propValue" ],
					attack:  [ ".gsuiEnvelope-prop[data-prop='attack']  gsui-slider", ".gsuiEnvelope-prop[data-prop='attack']  .gsuiEnvelope-propValue" ],
					hold:    [ ".gsuiEnvelope-prop[data-prop='hold']    gsui-slider", ".gsuiEnvelope-prop[data-prop='hold']    .gsuiEnvelope-propValue" ],
					decay:   [ ".gsuiEnvelope-prop[data-prop='decay']   gsui-slider", ".gsuiEnvelope-prop[data-prop='decay']   .gsuiEnvelope-propValue" ],
					sustain: [ ".gsuiEnvelope-prop[data-prop='sustain'] gsui-slider", ".gsuiEnvelope-prop[data-prop='sustain'] .gsuiEnvelope-propValue" ],
					release: [ ".gsuiEnvelope-prop[data-prop='release'] gsui-slider", ".gsuiEnvelope-prop[data-prop='release'] .gsuiEnvelope-propValue" ],
				},
			},
			$attributes: {
				type: "gain",
				toggle: false,
				timedivision: "4/4",
				amp: 24,
				attack: .1,
				hold: .1,
				decay: .1,
				sustain: .8,
				release: 1,
			},
		} );
		Object.seal( this );

		GSUlistenEvents( this, {
			gsuiSlider: {
				inputStart: GSUnoop,
				inputEnd: GSUnoop,
				input: ( d, sli ) => {
					this.#oninputSlider( sli.dataset.prop, d.args[ 0 ] );
				},
				change: ( d, sli ) => {
					this.#onchangeSlider( sli.dataset.prop, d.args[ 0 ] );
				},
			},
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.$updateWave();
	}
	static get observedAttributes() {
		return [ "type", "toggle", "amp", "attack", "hold", "decay", "sustain", "release" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "type":
				this.#type = val;
				this.$onresize();
				this.$updateWave();
				break;
			case "toggle": this.#changeToggle( val !== null ); break;
			case "timedivision": this.#changeTimedivision( val ); break;
			case "amp":
			case "attack":
			case "hold":
			case "decay":
			case "sustain":
			case "release":
				this.#changeProp( prop, +val );
				break;
		}
	}

	// .........................................................................
	$updateWave( prop, val ) {
		const g = this.$elements.$graph;
		const amp = prop === "amp" ? val : GSUgetAttributeNum( this, "amp" );
		const amp2 = this.#type === "detune" ? amp / 24 : 1;

		g.$amp = amp2;
		g.$attack = prop === "attack" ? val : GSUgetAttributeNum( this, "attack" );
		g.$hold = prop === "hold" ? val : GSUgetAttributeNum( this, "hold" );
		g.$decay = prop === "decay" ? val : GSUgetAttributeNum( this, "decay" );
		g.$sustain = prop === "sustain" ? val : GSUgetAttributeNum( this, "sustain" );
		g.$release = prop === "release" ? val : GSUgetAttributeNum( this, "release" );
		g.$duration =
		this.#dur = Math.max( g.$attack + g.$hold + g.$decay + .5 + g.$release, 2 );
		g.$draw();
		this.#updatePxPerBeat();
	}

	// .........................................................................
	#changeToggle( b ) {
		GSUsetAttribute( this.$elements.$sliders.amp[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.attack[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.hold[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.decay[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.sustain[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.release[ 0 ], "disabled", !b );
	}
	#changeTimedivision( val ) {
		GSUsetAttribute( this.$elements.$beatlines, "timedivision", val );
		this.$updateWave();
	}
	#changeProp( prop, val ) {
		const [ sli, span ] = this.$elements.$sliders[ prop ];

		sli.$setValue( val );
		span.textContent = gsuiEnvelope.#formatValue( prop, val );
	}
	#updatePxPerBeat() {
		GSUsetAttribute( this.$elements.$beatlines, "pxperbeat", this.#waveWidth / this.#dur );
	}
	static #formatValue( prop, val ) {
		return prop !== "amp"
			? val.toFixed( 2 )
			: GSUsignNum( val.toFixed( 0 ) );
	}

	// .........................................................................
	$onresize() {
		this.#waveWidth = this.$elements.$beatlines.getBoundingClientRect().width;
		this.#updatePxPerBeat();
		this.$elements.$graph.$resized();
	}
	#oninputSlider( prop, val ) {
		this.$elements.$sliders[ prop ][ 1 ].textContent = gsuiEnvelope.#formatValue( prop, val );
		this.$updateWave( prop, val );
		this.$dispatch( "liveChange", prop, val );
	}
	#onchangeSlider( prop, val ) {
		GSUsetAttribute( this, prop, val );
		this.$dispatch( "change", prop, val );
	}
}

GSUdefineElement( "gsui-envelope", gsuiEnvelope );
