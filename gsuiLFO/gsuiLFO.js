"use strict";

class gsuiLFO extends HTMLElement {
	#dur = 4;
	#waveWidth = 300;
	#nyquist = 24000;
	#dispatch = GSUdispatchEvent.bind( null, this, "gsuiLFO" );
	#onresizeBind = this.#onresize.bind( this );
	#children = GSUgetTemplate( "gsui-lfo" );
	#elements = GSUfindElements( this.#children, {
		title: ".gsuiLFO-title",
		beatlines: "gsui-beatlines",
		wave: "gsui-periodicwave",
		sliders: {
			delay:       [ ".gsuiLFO-delay       gsui-slider", ".gsuiLFO-delay       .gsuiLFO-propValue" ],
			attack:      [ ".gsuiLFO-attack      gsui-slider", ".gsuiLFO-attack      .gsuiLFO-propValue" ],
			speed:       [ ".gsuiLFO-speed       gsui-slider", ".gsuiLFO-speed       .gsuiLFO-propValue" ],
			amp:         [ ".gsuiLFO-amp         gsui-slider", ".gsuiLFO-amp         .gsuiLFO-propValue" ],
			lowpassfreq: [ ".gsuiLFO-lowpassfreq gsui-slider", ".gsuiLFO-lowpassfreq .gsuiLFO-propValue" ],
		},
	} );

	constructor() {
		super();
		Object.seal( this );

		this.onchange = this.#onchangeForm.bind( this );
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
			this.#elements.wave.$nbLines( 1 );
			GSUrecallAttributes( this, {
				toggle: false,
				timedivision: "4/4",
				type: "sine",
				delay: 0,
				attack: 1,
				speed: 1,
				amp: 1,
			} );
			this.updateWave();
		}
		GSUobserveSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		GSUunobserveSizeOf( this, this.#onresizeBind );
	}
	static get observedAttributes() {
		return [ "toggle", "timedivision", "type", "delay", "attack", "speed", "amp", "lowpassfreq" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			const num = +val;

			switch ( prop ) {
				case "timedivision": GSUsetAttribute( this.#elements.beatlines, "timedivision", val ); break;
				case "toggle": this.#changeToggle( val !== null ); break;
				case "type": this.#changeType( val ); break;
				case "delay":
				case "attack":
				case "speed":
				case "lowpassfreq":
					this.#changeProp( prop, num );
					break;
				case "amp":
					if ( num > 0 !== prev > 0 ) {
						this.#changeAmpSign( num );
					}
					this.#changeProp( "amp", Math.abs( num ) );
					break;
			}
		}
	}

	// .........................................................................
	updateWave( prop, val ) {
		const w = this.#elements.wave;
		const bPM = +GSUgetAttribute( this, "timedivision" ).split( "/" )[ 0 ];
		const opt = {
			type: GSUgetAttribute( this, "type" ),
			delay: prop === "delay" ? val : GSUgetAttributeNum( this, "delay" ),
			attack: prop === "attack" ? val : GSUgetAttributeNum( this, "attack" ),
			frequency: prop === "speed" ? val : GSUgetAttributeNum( this, "speed" ),
			amplitude: prop === "amp" ? val : GSUgetAttributeNum( this, "amp" ),
		};

		opt.duration =
		this.#dur = Math.max( opt.delay + opt.attack + 2, bPM );
		w.$options( 0, opt );
		w.style.opacity = Math.min( 6 / opt.frequency, 1 );
		this.#updatePxPerBeat();
	}

	// .........................................................................
	#changeToggle( b ) {
		this.querySelectorAll( ".gsuiLFO-typeRadio" ).forEach( el => GSUsetAttribute( el, "disabled", !b ) );
		GSUsetAttribute( this.#elements.sliders.delay[ 0 ], "disabled", !b );
		GSUsetAttribute( this.#elements.sliders.attack[ 0 ], "disabled", !b );
		GSUsetAttribute( this.#elements.sliders.speed[ 0 ], "disabled", !b );
		GSUsetAttribute( this.#elements.sliders.amp[ 0 ], "disabled", !b );
	}
	#changeType( type ) {
		this.#elements.wave.$options( 0, { type } );
		this.querySelector( `.gsuiLFO-typeRadio[value="${ type }"]` ).checked = true;
	}
	#changeAmpSign( amp ) {
		this.querySelector( `.gsuiLFO-ampSignRadio[value="${ Math.sign( amp ) || 1 }"]` ).checked = true;
	}
	#changeProp( prop, val ) {
		const sli = this.#elements.sliders[ prop ];

		if ( sli ) {
			sli[ 0 ].$setValue( val );
			sli[ 1 ].textContent = gsuiLFO.#formatVal( prop, val );
		}
	}
	#updatePxPerBeat() {
		GSUsetAttribute( this.#elements.beatlines, "pxPerBeat", this.#waveWidth / this.#dur );
	}
	static #formatVal( prop, val ) {
		return val.toFixed( 2 );
		// return prop === "lowpassfreq" ? val : val.toFixed( 2 );
	}

	// .........................................................................
	#onresize() {
		this.#waveWidth = this.#elements.beatlines.getBoundingClientRect().width;
		this.#updatePxPerBeat();
		this.#elements.wave.$resized();
	}
	#onchangeForm( e ) {
		switch ( e.target.name ) {
			case "gsuiLFO-type":
				GSUsetAttribute( this, "type", e.target.value );
				this.updateWave();
				this.#dispatch( "change", "type", e.target.value );
				break;
			case "gsuiLFO-ampSign":
				GSUsetAttribute( this, "amp", -GSUgetAttributeNum( this, "amp" ) );
				this.updateWave();
				this.#dispatch( "change", "amp", GSUgetAttributeNum( this, "amp" ) );
				break;
		}
	}
	#oninputSlider( prop, val ) {
		const realval = prop !== "amp"
			? val
			: val * Math.sign( GSUgetAttributeNum( this, "amp" ) );

		this.#elements.sliders[ prop ][ 1 ].textContent = gsuiLFO.#formatVal( prop, val );
		this.updateWave( prop, realval );
		this.#dispatch( "liveChange", prop, realval );
	}
	#onchangeSlider( prop, val ) {
		const nval = prop === "amp"
			? val * Math.sign( GSUgetAttributeNum( this, "amp" ) )
			: val;

		GSUsetAttribute( this, prop, nval );
		this.#dispatch( "change", prop, nval );
	}
}

Object.freeze( gsuiLFO );
customElements.define( "gsui-lfo", gsuiLFO );
