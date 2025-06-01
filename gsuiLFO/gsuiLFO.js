"use strict";

class gsuiLFO extends gsui0ne {
	#lfo = "gain";
	#amp = 1;
	#dur = 4;
	#waveWidth = 300;
	#keyPreviews = [];
	#keyAnimId = null;

	constructor() {
		super( {
			$cmpName: "gsuiLFO",
			$tagName: "gsui-lfo",
			$elements: {
				$beatlines: "gsui-beatlines",
				$wave: "gsui-periodicwave",
				$keyPreviews: ".gsuiLFO-keyPreviews",
				$sliders: {
					delay:  [ ".gsuiLFO-prop[data-prop='delay']  gsui-slider", ".gsuiLFO-prop[data-prop='delay']  .gsuiLFO-propValue" ],
					attack: [ ".gsuiLFO-prop[data-prop='attack'] gsui-slider", ".gsuiLFO-prop[data-prop='attack'] .gsuiLFO-propValue" ],
					speed:  [ ".gsuiLFO-prop[data-prop='speed']  gsui-slider", ".gsuiLFO-prop[data-prop='speed']  .gsuiLFO-propValue" ],
					amp:    [ ".gsuiLFO-prop[data-prop='amp']    gsui-slider", ".gsuiLFO-prop[data-prop='amp']    .gsuiLFO-propValue" ],
					lowpassfreq: [ ".gsuiLFO-lowpassfreq gsui-slider", ".gsuiLFO-lowpassfreq .gsuiLFO-propValue" ],
				},
			},
			$attributes: {
				lfo: "gain",
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
				input: ( d, sli ) => this.#oninputSlider( sli.dataset.prop, d.args[ 0 ] ),
				change: ( d, sli ) => this.#onchangeSlider( sli.dataset.prop, d.args[ 0 ] ),
			},
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.$elements.$wave.$nbLines( 1 );
		this.$updateWave();
	}
	static get observedAttributes() {
		return [ "lfo", "toggle", "timedivision", "type", "delay", "attack", "speed", "amp", "lowpassfreq" ];
	}
	$attributeChanged( prop, val, prev ) {
		if ( this.firstChild ) {
			const num = +val;

			switch ( prop ) {
				case "lfo":
					this.#lfo = val;
					GSUsetAttribute( this.$elements.$sliders.amp[ 0 ], "max", val === "gain" ? 1 : 12 );
					this.#changeProp( "amp", Math.abs( GSUgetAttribute( this, "amp" ) ) );
					this.$onresize();
					this.$updateWave();
					break;
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
					this.#amp = num;
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
		const bPM = +this.$getAttr( "timedivision" ).split( "/" )[ 0 ];
		const opt = {
			type: this.$getAttr( "type" ),
			delay: prop === "delay" ? val : this.$getAttrNum( "delay" ),
			attack: prop === "attack" ? val : this.$getAttrNum( "attack" ),
			frequency: prop === "speed" ? val : this.$getAttrNum( "speed" ),
			amplitude: prop === "amp" ? val : this.$getAttrNum( "amp" ),
		};

		if ( this.#lfo === "detune" ) {
			opt.amplitude /= 12;
		}
		opt.duration =
		this.#dur = Math.max( opt.delay + opt.attack + 2, bPM );
		w.$options( 0, opt );
		w.style.opacity = Math.min( 6 / opt.frequency, 1 );
		this.#updatePxPerBeat();
	}

	// .........................................................................
	#changeToggle( b ) {
		this.querySelectorAll( "input[type=radio]" ).forEach( el => GSUsetAttribute( el, "disabled", !b ) );
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
			GSUsetAttribute( sli[ 0 ], "value", val );
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
				this.$dispatch( "change", this.#lfo, "type", e.target.value );
				break;
			case "gsuiLFO-ampSign":
				GSUsetAttribute( this, "amp", -this.$getAttrNum( "amp" ) );
				this.$updateWave();
				this.$dispatch( "change", this.#lfo, "amp", this.$getAttrNum( "amp" ) );
				break;
		}
	}
	#oninputSlider( prop, val ) {
		const realval = prop !== "amp"
			? val
			: val * Math.sign( this.$getAttrNum( "amp" ) );

		this.$elements.$sliders[ prop ][ 1 ].textContent = gsuiLFO.#formatVal( prop, val );
		this.$updateWave( prop, realval );
		this.$dispatch( "liveChange", this.#lfo, prop, realval );
	}
	#onchangeSlider( prop, val ) {
		const nval = prop === "amp"
			? val * Math.sign( this.$getAttrNum( "amp" ) )
			: val;

		GSUsetAttribute( this, prop, nval );
		this.$dispatch( "change", this.#lfo, prop, nval );
	}

	// .........................................................................
	$startKey( id, bpm, dur = null ) {
		if ( GSUhasAttribute( this, "toggle" ) ) {
			const el = GSUcreateDiv( { class: "gsuiLFO-keyPreview", style: { left: 0, top: "50%" } } );

			this.#keyPreviews.push( {
				$id: id,
				$bps: bpm / 60,
				$dur: dur ?? Infinity,
				$elem: el,
				$when: Date.now() / 1000,
			} );
			this.$elements.$keyPreviews.append( el );
			if ( !this.#keyAnimId ) {
				this.#keyAnimId = GSUsetInterval( this.#keyAnimFrame.bind( this ), 1 / 60 );
			}
		}
	}
	$stopKey( id ) {
		this.#keyPreviews.forEach( p => {
			if ( p.$id === id ) {
				p.$dur = 0;
			}
		} );
	}
	#keyAnimFrame() {
		const toRm = [];

		this.#keyPreviews.forEach( this.#keyAnimFramePreview.bind( this, toRm, Date.now() / 1000 ) );
		if ( toRm.length > 0 ) {
			this.#keyPreviews = this.#keyPreviews.filter( p => !toRm.includes( p ) );
			if ( !this.#keyPreviews.length ) {
				GSUclearInterval( this.#keyAnimId );
				this.#keyAnimId = null;
			}
		}
	}
	#keyAnimFramePreview( toRm, now, p ) {
		const since = ( now - p.$when ) * p.$bps;
		const g = this.$elements.$graph;

		if ( since > p.$dur ) {
			p.$elem.remove();
			toRm.push( p );
		} else {
			const x = since / this.#dur;
			const y = this.$elements.$wave.$getY( 0, x * this.#waveWidth );

			GSUsetStyle( p.$elem, {
				top: `${ 50 + y * 50 }%`,
				left: `${ x * 100 }%`,
			} );
		}
	}

}

GSUdefineElement( "gsui-lfo", gsuiLFO );
