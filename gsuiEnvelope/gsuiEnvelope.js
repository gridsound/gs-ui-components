"use strict";

class gsuiEnvelope extends HTMLElement {
	#children = null
	#sliders = null
	#beatlines = null
	#graph = null
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiEnvelope" )
	#onresizeBind = this.#onresize.bind( this )
	#dur = 4
	#waveWidth = 300;

	constructor() {
		const children = GSUI.getTemplate( "gsui-envelope" ),
			beatlines = children[ 6 ].firstChild,
			graph = children[ 6 ].lastChild,
			sliders = Object.freeze( {
				attack: [ children[ 1 ].lastChild.firstChild, children[ 1 ].firstChild.lastChild ],
				hold: [ children[ 2 ].lastChild.firstChild, children[ 2 ].firstChild.lastChild ],
				decay: [ children[ 3 ].lastChild.firstChild, children[ 3 ].firstChild.lastChild ],
				substain: [ children[ 4 ].lastChild.firstChild, children[ 4 ].firstChild.lastChild ],
				release: [ children[ 5 ].lastChild.firstChild, children[ 5 ].firstChild.lastChild ],
			} );

		super();
		this.#children = children;
		this.#sliders = sliders;
		this.#beatlines = beatlines;
		this.#graph = graph;
		Object.seal( this );

		this.onchange = this.#onchangeForm.bind( this );
		this.#initSlider( "attack" );
		this.#initSlider( "hold" );
		this.#initSlider( "decay" );
		this.#initSlider( "substain" );
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
				substain: .8,
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
		return [ "toggle", "attack", "hold", "decay", "substain", "release" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "toggle": this.#changeToggle( val !== null ); break;
				case "attack":
				case "hold":
				case "decay":
				case "substain":
				case "release":
					this.#changeProp( prop, +val );
					break;
			}
		}
	}

	// .........................................................................
	timeDivision( a, b ) {
		this.#beatlines.setAttribute( "timedivision", `${ a }/${ b }` );
		this.updateWave();
	}
	updateWave( prop, val ) {
		const g = this.#graph;

		g.attack = prop === "attack" ? val : +this.getAttribute( "attack" );
		g.hold = prop === "hold" ? val : +this.getAttribute( "hold" );
		g.decay = prop === "decay" ? val : +this.getAttribute( "decay" );
		g.substain = prop === "substain" ? val : +this.getAttribute( "substain" );
		g.release = prop === "release" ? val : +this.getAttribute( "release" );
		g.duration =
		this.#dur = Math.max( g.attack + g.hold + g.decay + .5 + g.release, 2 );
		g.draw();
		this.#updatePxPerBeat();
	}

	// .........................................................................
	#changeToggle( b ) {
		this.classList.toggle( "gsuiEnvelope-enable", b );
		this.#sliders.attack[ 0 ].enable( b );
		this.#sliders.hold[ 0 ].enable( b );
		this.#sliders.decay[ 0 ].enable( b );
		this.#sliders.substain[ 0 ].enable( b );
		this.#sliders.release[ 0 ].enable( b );
	}
	#changeProp( prop, val ) {
		const [ sli, span ] = this.#sliders[ prop ];

		sli.setValue( val );
		span.textContent = val.toFixed( 2 );
	}

	// .........................................................................
	#updatePxPerBeat() {
		this.#beatlines.setAttribute( "pxperbeat", this.#waveWidth / this.#dur );
	}
	#initSlider( prop ) {
		const slider = this.#sliders[ prop ][ 0 ];

		slider.oninput = this.#oninputSlider.bind( this, prop );
		slider.onchange = this.#onchangeSlider.bind( this, prop );
	}

	// events:
	// .........................................................................
	#onresize() {
		this.#waveWidth = this.#beatlines.getBoundingClientRect().width;
		this.#updatePxPerBeat();
		this.#graph.resized();
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
		this.#sliders[ prop ][ 1 ].textContent = val.toFixed( 2 );
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
