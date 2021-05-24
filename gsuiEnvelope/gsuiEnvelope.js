"use strict";

class gsuiEnvelope extends HTMLElement {
	#dur = 4
	#waveWidth = 300
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiEnvelope" )
	#onresizeBind = this.#onresize.bind( this )
	#children = GSUI.getTemplate( "gsui-envelope" )
	#elements = GSUI.findElements( this.#children, {
		beatlines: "gsui-beatlines",
		graph: "gsui-envelopegraph",
		sliders: {
			attack:  [ ".gsuiEnvelope-attack  gsui-slider", ".gsuiEnvelope-attack  .gsuiEnvelope-propValue" ],
			hold:    [ ".gsuiEnvelope-hold    gsui-slider", ".gsuiEnvelope-hold    .gsuiEnvelope-propValue" ],
			decay:   [ ".gsuiEnvelope-decay   gsui-slider", ".gsuiEnvelope-decay   .gsuiEnvelope-propValue" ],
			sustain: [ ".gsuiEnvelope-sustain gsui-slider", ".gsuiEnvelope-sustain .gsuiEnvelope-propValue" ],
			release: [ ".gsuiEnvelope-release gsui-slider", ".gsuiEnvelope-release .gsuiEnvelope-propValue" ],
		},
	} )

	constructor() {
		super();
		Object.seal( this );

		this.onchange = this.#onchangeForm.bind( this );
		this.#initSlider( "attack" );
		this.#initSlider( "hold" );
		this.#initSlider( "decay" );
		this.#initSlider( "sustain" );
		this.#initSlider( "release" );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.classList.add( "gsuiEnvelope" );
			this.append( ...this.#children );
			this.#children = null;
			GSUI.recallAttributes( this, {
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
		GSUI.observeSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		GSUI.unobserveSizeOf( this, this.#onresizeBind );
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

		g.attack = prop === "attack" ? val : +this.getAttribute( "attack" );
		g.hold = prop === "hold" ? val : +this.getAttribute( "hold" );
		g.decay = prop === "decay" ? val : +this.getAttribute( "decay" );
		g.sustain = prop === "sustain" ? val : +this.getAttribute( "sustain" );
		g.release = prop === "release" ? val : +this.getAttribute( "release" );
		g.duration =
		this.#dur = Math.max( g.attack + g.hold + g.decay + .5 + g.release, 2 );
		g.draw();
		this.#updatePxPerBeat();
	}

	// .........................................................................
	#changeToggle( b ) {
		this.classList.toggle( "gsuiEnvelope-enable", b );
		this.#elements.sliders.attack[ 0 ].enable( b );
		this.#elements.sliders.hold[ 0 ].enable( b );
		this.#elements.sliders.decay[ 0 ].enable( b );
		this.#elements.sliders.sustain[ 0 ].enable( b );
		this.#elements.sliders.release[ 0 ].enable( b );
	}
	#changeTimedivision( val ) {
		this.#elements.beatlines.setAttribute( "timedivision", val );
		this.updateWave();
	}
	#changeProp( prop, val ) {
		const [ sli, span ] = this.#elements.sliders[ prop ];

		sli.setValue( val );
		span.textContent = val.toFixed( 2 );
	}

	// .........................................................................
	#updatePxPerBeat() {
		this.#elements.beatlines.setAttribute( "pxperbeat", this.#waveWidth / this.#dur );
	}
	#initSlider( prop ) {
		const slider = this.#elements.sliders[ prop ][ 0 ];

		slider.enable( false );
		slider.oninput = this.#oninputSlider.bind( this, prop );
		slider.onchange = this.#onchangeSlider.bind( this, prop );
	}

	// events:
	// .........................................................................
	#onresize() {
		this.#waveWidth = this.#elements.beatlines.getBoundingClientRect().width;
		this.#updatePxPerBeat();
		this.#elements.graph.resized();
	}
	#onchangeForm( e ) {
		switch ( e.target.name ) {
			case "gsuiEnvelope-toggle":
				GSUI.setAttribute( this, "toggle", !this.classList.contains( "gsuiEnvelope-enable" ) );
				this.#dispatch( "toggle" );
				break;
		}
	}
	#oninputSlider( prop, val ) {
		this.#elements.sliders[ prop ][ 1 ].textContent = val.toFixed( 2 );
		this.updateWave( prop, val );
		this.#dispatch( "liveChange", prop, val );
	}
	#onchangeSlider( prop, val ) {
		GSUI.setAttribute( this, prop, val );
		this.#dispatch( "change", prop, val );
	}
}

customElements.define( "gsui-envelope", gsuiEnvelope );

Object.freeze( gsuiEnvelope );
