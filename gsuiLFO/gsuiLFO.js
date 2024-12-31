"use strict";

class gsuiLFO extends gsui0ne {
	#dur = 4;
	#waveWidth = 300;
	#nyquist = 24000;

	constructor() {
		super( {
			$cmpName: "gsuiLFO",
			$tagName: "gsui-lfo",
			$elements: {
				$beatlines: "gsui-beatlines",
				$wave: "gsui-periodicwave",
				$sliders: {
					delay:  [ ".gsuiLFO-prop[data-prop='delay']  gsui-slider", ".gsuiLFO-prop[data-prop='delay']  .gsuiLFO-propValue" ],
					attack: [ ".gsuiLFO-prop[data-prop='attack'] gsui-slider", ".gsuiLFO-prop[data-prop='attack'] .gsuiLFO-propValue" ],
					speed:  [ ".gsuiLFO-prop[data-prop='speed']  gsui-slider", ".gsuiLFO-prop[data-prop='speed']  .gsuiLFO-propValue" ],
					amp:    [ ".gsuiLFO-prop[data-prop='amp']    gsui-slider", ".gsuiLFO-prop[data-prop='amp']    .gsuiLFO-propValue" ],
					lowpassfreq: [ ".gsuiLFO-lowpassfreq gsui-slider", ".gsuiLFO-lowpassfreq .gsuiLFO-propValue" ],
				},
			},
			$attributes: {
				toggle: false,
				timedivision: "4/4",
				type: "sine",
				delay: 0,
				attack: 1,
				speed: 1,
				amp: 1,
			},
		} );
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
	$firstTimeConnected() {
		this.$elements.$wave.$nbLines( 1 );
		this.$updateWave();
	}
	static get observedAttributes() {
		return [ "toggle", "timedivision", "type", "delay", "attack", "speed", "amp", "lowpassfreq" ];
	}
	$attributeChanged( prop, val, prev ) {
		if ( this.firstChild ) {
			const num = +val;

			switch ( prop ) {
				case "timedivision": GSUsetAttribute( this.$elements.$beatlines, "timedivision", val ); break;
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
	$updateWave( prop, val ) {
		const w = this.$elements.$wave;
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
		GSUsetAttribute( this.$elements.$sliders.delay[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.attack[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.speed[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.amp[ 0 ], "disabled", !b );
	}
	#changeType( type ) {
		this.$elements.$wave.$options( 0, { type } );
		this.querySelector( `.gsuiLFO-typeRadio[value="${ type }"]` ).checked = true;
	}
	#changeAmpSign( amp ) {
		this.querySelector( `.gsuiLFO-ampSignRadio[value="${ Math.sign( amp ) || 1 }"]` ).checked = true;
	}
	#changeProp( prop, val ) {
		const sli = this.$elements.$sliders[ prop ];

		if ( sli ) {
			sli[ 0 ].$setValue( val );
			sli[ 1 ].textContent = gsuiLFO.#formatVal( prop, val );
		}
	}
	#updatePxPerBeat() {
		GSUsetAttribute( this.$elements.$beatlines, "pxPerBeat", this.#waveWidth / this.#dur );
	}
	static #formatVal( prop, val ) {
		return val.toFixed( 2 );
	}

	// .........................................................................
	$onresize() {
		this.#waveWidth = this.$elements.$beatlines.getBoundingClientRect().width;
		this.#updatePxPerBeat();
		this.$elements.$wave.$resized();
	}
	#onchangeForm( e ) {
		switch ( e.target.name ) {
			case "gsuiLFO-type":
				GSUsetAttribute( this, "type", e.target.value );
				this.$updateWave();
				this.$dispatch( "change", "type", e.target.value );
				break;
			case "gsuiLFO-ampSign":
				GSUsetAttribute( this, "amp", -GSUgetAttributeNum( this, "amp" ) );
				this.$updateWave();
				this.$dispatch( "change", "amp", GSUgetAttributeNum( this, "amp" ) );
				break;
		}
	}
	#oninputSlider( prop, val ) {
		const realval = prop !== "amp"
			? val
			: val * Math.sign( GSUgetAttributeNum( this, "amp" ) );

		this.$elements.$sliders[ prop ][ 1 ].textContent = gsuiLFO.#formatVal( prop, val );
		this.$updateWave( prop, realval );
		this.$dispatch( "liveChange", prop, realval );
	}
	#onchangeSlider( prop, val ) {
		const nval = prop === "amp"
			? val * Math.sign( GSUgetAttributeNum( this, "amp" ) )
			: val;

		GSUsetAttribute( this, prop, nval );
		this.$dispatch( "change", prop, nval );
	}
}

GSUdefineElement( "gsui-lfo", gsuiLFO );
