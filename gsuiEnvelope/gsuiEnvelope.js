"use strict";

class gsuiEnvelope extends HTMLElement {
	#dur = 4;
	#waveWidth = 300;
	#dispatch = GSUdispatchEvent.bind( null, this, "gsuiEnvelope" );
	#onresizeBind = this.#onresize.bind( this );
	#children = GSUgetTemplate( "gsui-envelope" );
	#elements = GSUfindElements( this.#children, {
		beatlines: "gsui-beatlines",
		graph: "gsui-envelope-graph",
		sliders: {
			attack:  [ ".gsuiEnvelope-attack  gsui-slider", ".gsuiEnvelope-attack  .gsuiEnvelope-propValue" ],
			hold:    [ ".gsuiEnvelope-hold    gsui-slider", ".gsuiEnvelope-hold    .gsuiEnvelope-propValue" ],
			decay:   [ ".gsuiEnvelope-decay   gsui-slider", ".gsuiEnvelope-decay   .gsuiEnvelope-propValue" ],
			sustain: [ ".gsuiEnvelope-sustain gsui-slider", ".gsuiEnvelope-sustain .gsuiEnvelope-propValue" ],
			release: [ ".gsuiEnvelope-release gsui-slider", ".gsuiEnvelope-release .gsuiEnvelope-propValue" ],
		},
	} );

	constructor() {
		super();
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
	connectedCallback() {
		if ( this.#children ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUrecallAttributes( this, {
				toggle: false,
				timedivision: "4/4",
				attack: .1,
				hold: .1,
				decay: .1,
				sustain: .8,
				release: 1,
			} );
			this.updateWave();
		}
		GSUobserveSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		GSUunobserveSizeOf( this, this.#onresizeBind );
	}
	static get observedAttributes() {
		return [ "toggle", "attack", "hold", "decay", "sustain", "release" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
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
	}

	// .........................................................................
	updateWave( prop, val ) {
		const g = this.#elements.graph;

		g.attack = prop === "attack" ? val : GSUgetAttributeNum( this, "attack" );
		g.hold = prop === "hold" ? val : GSUgetAttributeNum( this, "hold" );
		g.decay = prop === "decay" ? val : GSUgetAttributeNum( this, "decay" );
		g.sustain = prop === "sustain" ? val : GSUgetAttributeNum( this, "sustain" );
		g.release = prop === "release" ? val : GSUgetAttributeNum( this, "release" );
		g.duration =
		this.#dur = Math.max( g.attack + g.hold + g.decay + .5 + g.release, 2 );
		g.$draw();
		this.#updatePxPerBeat();
	}

	// .........................................................................
	#changeToggle( b ) {
		GSUsetAttribute( this.#elements.sliders.attack[ 0 ], "disabled", !b );
		GSUsetAttribute( this.#elements.sliders.hold[ 0 ], "disabled", !b );
		GSUsetAttribute( this.#elements.sliders.decay[ 0 ], "disabled", !b );
		GSUsetAttribute( this.#elements.sliders.sustain[ 0 ], "disabled", !b );
		GSUsetAttribute( this.#elements.sliders.release[ 0 ], "disabled", !b );
	}
	#changeTimedivision( val ) {
		GSUsetAttribute( this.#elements.beatlines, "timedivision", val );
		this.updateWave();
	}
	#changeProp( prop, val ) {
		const [ sli, span ] = this.#elements.sliders[ prop ];

		sli.$setValue( val );
		span.textContent = val.toFixed( 2 );
	}
	#updatePxPerBeat() {
		GSUsetAttribute( this.#elements.beatlines, "pxperbeat", this.#waveWidth / this.#dur );
	}

	// .........................................................................
	#onresize() {
		this.#waveWidth = this.#elements.beatlines.getBoundingClientRect().width;
		this.#updatePxPerBeat();
		this.#elements.graph.resized();
	}
	#oninputSlider( prop, val ) {
		this.#elements.sliders[ prop ][ 1 ].textContent = val.toFixed( 2 );
		this.updateWave( prop, val );
		this.#dispatch( "liveChange", prop, val );
	}
	#onchangeSlider( prop, val ) {
		GSUsetAttribute( this, prop, val );
		this.#dispatch( "change", prop, val );
	}
}

Object.freeze( gsuiEnvelope );
customElements.define( "gsui-envelope", gsuiEnvelope );
