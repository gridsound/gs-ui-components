"use strict";

class gsuiLFO extends HTMLElement {
	#dur = 4
	#waveWidth = 300
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiLFO" )
	#onresizeBind = this.#onresize.bind( this )
	#children = GSUI.getTemplate( "gsui-lfo" )
	#elements = GSUI.findElements( this.#children, {
		beatlines: "gsui-beatlines",
		wave: "gsui-periodicwave",
		sliders: {
			delay:  [ ".gsuiLFO-delay  gsui-slider", ".gsuiLFO-delay  .gsuiLFO-propValue" ],
			attack: [ ".gsuiLFO-attack gsui-slider", ".gsuiLFO-attack .gsuiLFO-propValue" ],
			speed:  [ ".gsuiLFO-speed  gsui-slider", ".gsuiLFO-speed  .gsuiLFO-propValue" ],
			amp:    [ ".gsuiLFO-amp    gsui-slider", ".gsuiLFO-amp    .gsuiLFO-propValue" ],
		},
	} )

	constructor() {
		super();
		Object.seal( this );

		this.onchange = this.#onchangeForm.bind( this );
		this.#initSlider( "delay" );
		this.#initSlider( "attack" );
		this.#initSlider( "speed" );
		this.#initSlider( "amp" );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.classList.add( "gsuiLFO" );
			this.append( ...this.#children );
			this.#children = null;
			GSUI.recallAttributes( this, {
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
		GSUI.observeSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		GSUI.unobserveSizeOf( this, this.#onresizeBind );
	}
	static get observedAttributes() {
		return [ "toggle", "timedivision", "type", "delay", "attack", "speed", "amp" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			const num = +val;

			switch ( prop ) {
				case "timedivision": this.#elements.beatlines.setAttribute( "timedivision", val ); break;
				case "toggle": this.#changeToggle( val !== null ); break;
				case "type": this.#changeType( val ); break;
				case "delay":
				case "attack":
				case "speed":
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
		const w = this.#elements.wave,
			bPM = +this.getAttribute( "timedivision" ).split( "/" )[ 0 ];

		w.type = this.getAttribute( "type" );
		w.delay = prop === "delay" ? val : +this.getAttribute( "delay" );
		w.attack = prop === "attack" ? val : +this.getAttribute( "attack" );
		w.frequency = prop === "speed" ? val : +this.getAttribute( "speed" );
		w.amplitude = prop === "amp" ? val : +this.getAttribute( "amp" );
		w.duration =
		this.#dur = Math.max( w.delay + w.attack + 2, bPM );
		w.draw();
		w.style.opacity = Math.min( 6 / w.frequency, 1 );
		this.#updatePxPerBeat();
	}

	// .........................................................................
	#changeToggle( b ) {
		this.classList.toggle( "gsuiLFO-enable", b );
		this.querySelectorAll( ".gsuiLFO-typeRadio" )
			.forEach( b
				? el => el.removeAttribute( "disabled" )
				: el => el.setAttribute( "disabled", "" ) );
		this.#elements.sliders.delay[ 0 ].enable( b );
		this.#elements.sliders.attack[ 0 ].enable( b );
		this.#elements.sliders.speed[ 0 ].enable( b );
		this.#elements.sliders.amp[ 0 ].enable( b );
	}
	#changeType( type ) {
		this.#elements.wave.type = type;
		this.querySelector( `.gsuiLFO-typeRadio[value="${ type }"]` ).checked = true;
	}
	#changeAmpSign( amp ) {
		this.querySelector( `.gsuiLFO-ampSignRadio[value="${ Math.sign( amp ) || 1 }"]` ).checked = true;
	}
	#changeProp( prop, val ) {
		const [ sli, span ] = this.#elements.sliders[ prop ];

		sli.setValue( val );
		span.textContent = val.toFixed( 2 );
	}

	// .........................................................................
	#updatePxPerBeat() {
		this.#elements.beatlines.setAttribute( "pxPerBeat", this.#waveWidth / this.#dur );
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
		this.#elements.wave.resized();
	}
	#onchangeForm( e ) {
		switch ( e.target.name ) {
			case "gsuiLFO-toggle":
				GSUI.setAttribute( this, "toggle", !this.classList.contains( "gsuiLFO-enable" ) );
				this.#dispatch( "toggle" );
				break;
			case "gsuiLFO-type":
				GSUI.setAttribute( this, "type", e.target.value );
				this.updateWave();
				this.#dispatch( "change", "type", e.target.value );
				break;
			case "gsuiLFO-ampSign":
				GSUI.setAttribute( this, "amp", -this.getAttribute( "amp" ) );
				this.updateWave();
				this.#dispatch( "change", "amp", +this.getAttribute( "amp" ) );
				break;
		}
	}
	#oninputSlider( prop, val ) {
		const realval = prop !== "amp"
				? val
				: val * Math.sign( this.getAttribute( "amp" ) );

		this.#elements.sliders[ prop ][ 1 ].textContent = val.toFixed( 2 );
		this.updateWave( prop, realval );
		this.#dispatch( "liveChange", prop, realval );
	}
	#onchangeSlider( prop, val ) {
		const nval = prop === "amp"
				? val * Math.sign( this.getAttribute( "amp" ) )
				: val;

		GSUI.setAttribute( this, prop, nval );
		this.#dispatch( "change", prop, nval );
	}
}

customElements.define( "gsui-lfo", gsuiLFO );

Object.freeze( gsuiLFO );
