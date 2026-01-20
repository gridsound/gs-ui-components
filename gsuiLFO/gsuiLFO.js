"use strict";

class gsuiLFO extends gsui0ne {
	#lfo = "gain";
	#dur = 4;
	#waveWidth = 300;
	#keyPreviews = [];
	#keyAnimId = null;

	constructor() {
		super( {
			$cmpName: "gsuiLFO",
			$tagName: "gsui-lfo",
			$jqueryfy: true,
			$elements: {
				$beatlines: "gsui-beatlines",
				$wave: "gsui-periodicwave",
				$keyPreviews: ".gsuiLFO-keyPreviews",
				$propSli: "gsui-slider",
				$propVal: "gs-output",
			},
			$attributes: {
				lfo: "gain",
				toggle: false,
				timedivision: "5/5",
				type: "sine",
				delay: 0,
				attack: 1,
				speed: 1,
				amp: 1,
			},
		} );
		Object.seal( this );
		this.onchange = this.#onchangeForm.bind( this );
		GSUdomListen( this, {
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( d, val ) => this.#oninputSlider( d.$target.parentNode.dataset.prop, val ),
			[ GSEV_SLIDER_CHANGE ]: ( d, val ) => this.#onchangeSlider( d.$target.parentNode.dataset.prop, val ),
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.$elements.$wave.$at( 0 ).$nbLines( 1 );
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
					this.#getPropSlider( "amp" ).$attr( "max", val === "gain" ? 1 : 12 );
					this.#changeProp( "amp", Math.abs( this.$this.$attr( "amp" ) ) );
					this.$onresize();
					this.$updateWave();
					this.#updateBeatlinesColor();
					break;
				case "timedivision":
					this.$elements.$beatlines.$attr( "timedivision", val );
					break;
				case "toggle":
					this.#changeToggle( val !== null );
					this.#updateBeatlinesColor();
					break;
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
		const bPM = +( this.$this.$attr( "timedivision" ) || "4/4" ).split( "/" )[ 0 ];
		const opt = {
			type: this.$this.$attr( "type" ),
			delay: prop === "delay" ? val : +this.$this.$attr( "delay" ),
			attack: prop === "attack" ? val : +this.$this.$attr( "attack" ),
			frequency: prop === "speed" ? val : +this.$this.$attr( "speed" ),
			amplitude: prop === "amp" ? val : +this.$this.$attr( "amp" ),
		};

		if ( this.#lfo === "detune" ) {
			opt.amplitude /= 12;
		}
		opt.duration =
		this.#dur = Math.max( opt.delay + opt.attack + 2, bPM );
		this.$elements.$wave
			.$css( "opacity", Math.min( 6 / opt.frequency, 1 ) )
			.$at( 0 ).$options( 0, opt );
		this.#updatePxPerBeat();
	}

	// .........................................................................
	#getPropSlider( prop ) { return this.$elements.$propSli.$filter( `[data-prop="${ prop }"] gsui-slider` ); }
	#getPropOutput( prop ) { return this.$elements.$propVal.$filter( `[data-prop="${ prop }"] gs-output` ); }
	#changeToggle( b ) {
		this.$this.$find( "[type=radio]" ).$attr( "disabled", !b );
		this.$elements.$propSli.$attr( "disabled", !b );
	}
	#changeType( type ) {
		this.$elements.$wave.$at( 0 ).$options( 0, { type } );
		GSUdomQS( this, `[type="radio"][value="${ type }"]` ).checked = true;
	}
	#changeAmpSign( amp ) {
		GSUdomQS( this, `[type="radio"][value="${ Math.sign( amp ) || 1 }"]` ).checked = true;
	}
	#changeProp( prop, val ) {
		this.#getPropSlider( prop ).$attr( "value", val );
		this.#getPropOutput( prop ).$text( gsuiLFO.#formatVal( prop, val ) );
	}
	#updatePxPerBeat() {
		this.$elements.$beatlines.$attr( "pxPerBeat", this.#waveWidth / this.#dur );
	}
	static #formatVal( prop, val ) {
		return val.toFixed( 2 );
	}

	// .........................................................................
	$onresize() {
		this.#waveWidth = GSUdomBCRwh( this.$elements.$beatlines.$at( 0 ) )[ 0 ];
		this.#updatePxPerBeat();
		this.$elements.$wave.$at( 0 ).$resized();
	}
	#onchangeForm( e ) {
		switch ( e.target.name ) {
			case "gsuiLFO-type":
				this.$this.$attr( "type", e.target.value );
				this.$updateWave();
				GSUdomDispatch( this, GSEV_LFO_CHANGE, this.#lfo, "type", e.target.value );
				break;
			case "gsuiLFO-ampSign":
				this.$this.$attr( "amp", -this.$this.$attr( "amp" ) );
				this.$updateWave();
				GSUdomDispatch( this, GSEV_LFO_CHANGE, this.#lfo, "amp", +this.$this.$attr( "amp" ) );
				break;
		}
	}
	#oninputSlider( prop, val ) {
		const realval = prop === "amp"
			? val * Math.sign( this.$this.$attr( "amp" ) )
			: val;

		this.#getPropOutput( prop ).$text( gsuiLFO.#formatVal( prop, val ) );
		this.$updateWave( prop, realval );
		GSUdomDispatch( this, GSEV_LFO_LIVECHANGE, this.#lfo, prop, realval );
	}
	#onchangeSlider( prop, val ) {
		const nval = prop === "amp"
			? val * Math.sign( this.$this.$attr( "amp" ) )
			: val;

		this.$this.$attr( prop, nval );
		GSUdomDispatch( this, GSEV_LFO_CHANGE, this.#lfo, prop, nval );
	}
	#updateBeatlinesColor() {
		this.$elements.$beatlines.$attr( "color", this.$this.$css( "--gsuiLFO-input-col" ) );
	}

	// .........................................................................
	$startKey( id, bpm, dur = null ) {
		if ( this.$this.$hasAttr( "toggle" ) ) {
			const el = GSUcreateDiv( { class: "gsuiLFO-keyPreview", style: { left: 0, top: "50%" } } );

			this.#keyPreviews.push( {
				$id: id,
				$bps: bpm / 60,
				$dur: dur ?? Infinity,
				$elem: el,
				$when: Date.now() / 1000,
			} );
			this.$elements.$keyPreviews.$append( el );
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

		if ( since > p.$dur ) {
			p.$elem.remove();
			toRm.push( p );
		} else {
			const x = since / this.#dur;
			const y = this.$elements.$wave.$at( 0 ).$getY( 0, x * this.#waveWidth );

			GSUdomStyle( p.$elem, {
				top: `${ 50 + y * 50 }%`,
				left: `${ x * 100 }%`,
			} );
		}
	}
}

GSUdomDefine( "gsui-lfo", gsuiLFO );
