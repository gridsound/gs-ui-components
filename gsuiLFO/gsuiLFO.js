"use strict";

class gsuiLFO extends HTMLElement {
	#dur = 4;
	#waveWidth = 300;
	#nyquist = 24000;
	#dispatch = GSUI.dispatchEv.bind( null, this, "gsuiLFO" );
	#onresizeBind = this.#onresize.bind( this );
	#children = GSUI.getTemplate( "gsui-lfo" );
	#elements = GSUI.findElem( this.#children, {
		title: ".gsuiLFO-title",
		beatlines: "gsui-beatlines",
		wave: "gsui-periodicwave",
		sliders: {
			delay:  [ ".gsuiLFO-delay  gsui-slider", ".gsuiLFO-delay  .gsuiLFO-propValue" ],
			attack: [ ".gsuiLFO-attack gsui-slider", ".gsuiLFO-attack .gsuiLFO-propValue" ],
			speed:  [ ".gsuiLFO-speed  gsui-slider", ".gsuiLFO-speed  .gsuiLFO-propValue" ],
			amp:    [ ".gsuiLFO-amp    gsui-slider", ".gsuiLFO-amp    .gsuiLFO-propValue" ],
			lowpassfreq: null,
		},
	} );

	constructor() {
		super();
		Object.seal( this );

		this.onchange = this.#onchangeForm.bind( this );
		GSUI.listenEv( this, {
			gsuiSlider: {
				inputStart: GSUI.noop,
				inputEnd: GSUI.noop,
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
			GSUI.recallAttributes( this, {
				target: "gain",
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
		return [ "target", "toggle", "timedivision", "type", "delay", "attack", "speed", "amp", "lowpassfreq" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			const num = +val;

			switch ( prop ) {
				case "target": this.#changeTarget( val ); break;
				case "timedivision": GSUI.setAttr( this.#elements.beatlines, "timedivision", val ); break;
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
		const bPM = +GSUI.getAttr( this, "timedivision" ).split( "/" )[ 0 ];

		w.type = GSUI.getAttr( this, "type" );
		w.delay = prop === "delay" ? val : GSUI.getAttrNum( this, "delay" );
		w.attack = prop === "attack" ? val : GSUI.getAttrNum( this, "attack" );
		w.frequency = prop === "speed" ? val : GSUI.getAttrNum( this, "speed" );
		w.amplitude = prop === "amp" ? val : GSUI.getAttrNum( this, "amp" );
		w.duration =
		this.#dur = Math.max( w.delay + w.attack + 2, bPM );
		w.draw();
		w.style.opacity = Math.min( 6 / w.frequency, 1 );
		this.#updatePxPerBeat();
	}

	// .........................................................................
	#changeTarget( t ) {
		this.#elements.title.textContent = `LFO ${ t }`;

		switch ( t ) {
			case "gain":
				if ( this.#elements.sliders.lowpassfreq ) {
					this.#elements.sliders.lowpassfreq[ 0 ].parentNode.parentNode.remove();
					this.#elements.sliders.lowpassfreq = null;
				}
				break;
			case "lowpass": {
				const lpFreq = GSUI.getTemplate( "gsui-lfo-slider", [ "lowpassfreq", "lowpass frequency", "LP", 10, this.#nyquist, 10 ] );

				this.#elements.sliders.amp[ 0 ].parentNode.parentNode.after( lpFreq );
				this.#elements.sliders.lowpassfreq = GSUI.findElem( lpFreq, [ "gsui-slider", ".gsuiLFO-propValue" ] );
			} break;
		}
	}
	#changeToggle( b ) {
		this.classList.toggle( "gsuiLFO-enable", b );
		this.querySelectorAll( ".gsuiLFO-typeRadio" ).forEach( el => GSUI.setAttr( el, "disabled", !b ) );
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
		const sli = this.#elements.sliders[ prop ];

		if ( sli ) {
			sli[ 0 ].setValue( val );
			sli[ 1 ].textContent = gsuiLFO.#formatVal( prop, val );
		}
	}
	#updatePxPerBeat() {
		GSUI.setAttr( this.#elements.beatlines, "pxPerBeat", this.#waveWidth / this.#dur );
	}
	static #formatVal( prop, val ) {
		return prop === "lowpassfreq" ? val : val.toFixed( 2 );
	}

	// .........................................................................
	#onresize() {
		this.#waveWidth = this.#elements.beatlines.getBoundingClientRect().width;
		this.#updatePxPerBeat();
		this.#elements.wave.resized();
	}
	#onchangeForm( e ) {
		switch ( e.target.name ) {
			case "gsuiLFO-toggle":
				GSUI.setAttr( this, "toggle", !this.classList.contains( "gsuiLFO-enable" ) );
				this.#dispatch( "toggle" );
				break;
			case "gsuiLFO-type":
				GSUI.setAttr( this, "type", e.target.value );
				this.updateWave();
				this.#dispatch( "change", "type", e.target.value );
				break;
			case "gsuiLFO-ampSign":
				GSUI.setAttr( this, "amp", -GSUI.getAttrNum( this, "amp" ) );
				this.updateWave();
				this.#dispatch( "change", "amp", GSUI.getAttrNum( this, "amp" ) );
				break;
		}
	}
	#oninputSlider( prop, val ) {
		const realval = prop !== "amp"
			? val
			: val * Math.sign( GSUI.getAttrNum( this, "amp" ) );

		this.#elements.sliders[ prop ][ 1 ].textContent = gsuiLFO.#formatVal( prop, val );
		this.updateWave( prop, realval );
		this.#dispatch( "liveChange", prop, realval );
	}
	#onchangeSlider( prop, val ) {
		const nval = prop === "amp"
			? val * Math.sign( GSUI.getAttrNum( this, "amp" ) )
			: val;

		GSUI.setAttr( this, prop, nval );
		this.#dispatch( "change", prop, nval );
	}
}

Object.freeze( gsuiLFO );
customElements.define( "gsui-lfo", gsuiLFO );
