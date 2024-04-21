"use strict";

class gsuiEnvelope extends gsui0ne {
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
					attack:  [ ".gsuiEnvelope-attack  gsui-slider", ".gsuiEnvelope-attack  .gsuiEnvelope-propValue" ],
					hold:    [ ".gsuiEnvelope-hold    gsui-slider", ".gsuiEnvelope-hold    .gsuiEnvelope-propValue" ],
					decay:   [ ".gsuiEnvelope-decay   gsui-slider", ".gsuiEnvelope-decay   .gsuiEnvelope-propValue" ],
					sustain: [ ".gsuiEnvelope-sustain gsui-slider", ".gsuiEnvelope-sustain .gsuiEnvelope-propValue" ],
					release: [ ".gsuiEnvelope-release gsui-slider", ".gsuiEnvelope-release .gsuiEnvelope-propValue" ],
				},
			},
			$attributes: {
				toggle: false,
				timedivision: "4/4",
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
		this.updateWave();
	}
	static get observedAttributes() {
		return [ "toggle", "attack", "hold", "decay", "sustain", "release" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "toggle": this.#changeToggle( val !== null ); break;
			case "timedivision": this.#changeTimedivision( val ); break;
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
	updateWave( prop, val ) {
		const g = this.$elements.$graph;

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
		GSUsetAttribute( this.$elements.$sliders.attack[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.hold[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.decay[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.sustain[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.release[ 0 ], "disabled", !b );
	}
	#changeTimedivision( val ) {
		GSUsetAttribute( this.$elements.$beatlines, "timedivision", val );
		this.updateWave();
	}
	#changeProp( prop, val ) {
		const [ sli, span ] = this.$elements.$sliders[ prop ];

		sli.$setValue( val );
		span.textContent = val.toFixed( 2 );
	}
	#updatePxPerBeat() {
		GSUsetAttribute( this.$elements.$beatlines, "pxperbeat", this.#waveWidth / this.#dur );
	}

	// .........................................................................
	$onresize() {
		this.#waveWidth = this.$elements.$beatlines.getBoundingClientRect().width;
		this.#updatePxPerBeat();
		this.$elements.$graph.resized();
	}
	#oninputSlider( prop, val ) {
		this.$elements.$sliders[ prop ][ 1 ].textContent = val.toFixed( 2 );
		this.updateWave( prop, val );
		this.$dispatch( "liveChange", prop, val );
	}
	#onchangeSlider( prop, val ) {
		GSUsetAttribute( this, prop, val );
		this.$dispatch( "change", prop, val );
	}
}

Object.freeze( gsuiEnvelope );
customElements.define( "gsui-envelope", gsuiEnvelope );
