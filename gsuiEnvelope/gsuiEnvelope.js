"use strict";

class gsuiEnvelope extends gsui0ne {
	#env = "gain";
	#dur = 4;
	#ppb = 0;
	#waveWidth = 300;
	#keyPreviews = [];
	#keyAnimId = null;

	constructor() {
		super( {
			$cmpName: "gsuiEnvelope",
			$tagName: "gsui-envelope",
			$jqueryfy: true,
			$elements: {
				$beatlines: "gsui-beatlines",
				$graph: "gsui-envelope-graph",
				$keyPreviews: ".gsuiEnvelope-keyPreviews",
				$propSli: "gsui-slider",
				$propVal: "gs-output",
			},
			$attributes: {
				env: "gain",
				toggle: false,
				timedivision: "4/4",
				amp: 24,
				q: 1,
				attack: .1,
				hold: .1,
				decay: .1,
				sustain: .8,
				release: 1,
			},
		} );
		Object.seal( this );
		GSUdomListen( this, {
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( d, val ) => this.#oninputSlider( d.$target.dataset.prop, val ),
			[ GSEV_SLIDER_CHANGE ]: ( d, val ) => this.#onchangeSlider( d.$target.dataset.prop, val ),
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.$updateWave();
	}
	static get observedAttributes() {
		return [ "env", "toggle", "timedivision", "amp", "q", "attack", "hold", "decay", "sustain", "release" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "env":
				this.#env = val;
				this.$onresize();
				this.$updateWave();
				this.#updateBeatlinesColor();
				break;
			case "toggle":
				this.$elements.$propSli.$attr( "disabled", val === null );
				this.#updateBeatlinesColor();
				break;
			case "timedivision":
				this.#changeTimedivision( val );
				break;
			case "amp":
			case "q":
			case "attack":
			case "hold":
			case "decay":
			case "sustain":
			case "release":
				this.#getPropSlider( prop ).$attr( "value", +val );
				this.#getPropOutput( prop ).$text( gsuiEnvelope.#formatValue( prop, +val ) );
				break;
		}
	}

	// .........................................................................
	$updateWave( prop, val ) {
		const g = this.$elements.$graph.$at( 0 );
		const amp = prop === "amp" ? val : GSUdomGetAttrNum( this, "amp" );
		const amp2 = this.#env === "detune" ? amp / 24 : 1;

		g.$amp = amp2;
		g.$attack = prop === "attack" ? val : GSUdomGetAttrNum( this, "attack" );
		g.$hold = prop === "hold" ? val : GSUdomGetAttrNum( this, "hold" );
		g.$decay = prop === "decay" ? val : GSUdomGetAttrNum( this, "decay" );
		g.$sustain = prop === "sustain" ? val : GSUdomGetAttrNum( this, "sustain" );
		g.$release = prop === "release" ? val : GSUdomGetAttrNum( this, "release" );
		g.$duration =
		this.#dur = Math.max( g.$attack + g.$hold + g.$decay + .5 + g.$release, 2 );
		g.$draw();
		this.#updatePxPerBeat();
	}

	// .........................................................................
	#getPropSlider( prop ) { return this.$elements.$propSli.$filter( `[data-prop="${ prop }"]` ); }
	#getPropOutput( prop ) { return this.$elements.$propVal.$filter( `[data-prop="${ prop }"]` ); }
	#changeTimedivision( val ) {
		this.$elements.$beatlines.$attr( "timedivision", val );
		this.$updateWave();
	}
	#updatePxPerBeat() {
		this.#ppb = this.#waveWidth / this.#dur;
		this.$elements.$beatlines.$attr( "pxperbeat", this.#ppb );
	}
	static #formatValue( prop, val ) {
		return prop !== "amp"
			? val.toFixed( 2 )
			: GSUmathSign( val.toFixed( 0 ) );
	}

	// .........................................................................
	$onresize() {
		const nbProps = this.#env === "gain" ? 5 : 6;

		this.style.minHeight = `${ nbProps * 20 - 2 + 2 * 8 }px`;
		this.#waveWidth = GSUdomBCRwh( this.$elements.$beatlines.$at( 0 ) )[ 0 ];
		this.#updatePxPerBeat();
		this.$elements.$graph.$at( 0 ).$resized();
	}
	#oninputSlider( prop, val ) {
		this.#getPropOutput( prop ).$text( gsuiEnvelope.#formatValue( prop, val ) );
		this.$updateWave( prop, val );
		GSUdomDispatch( this, GSEV_ENVELOPE_LIVECHANGE, this.#env, prop, val );
	}
	#onchangeSlider( prop, val ) {
		this.$this.$attr( prop, val );
		GSUdomDispatch( this, GSEV_ENVELOPE_CHANGE, this.#env, prop, val );
	}
	#updateBeatlinesColor() {
		this.$elements.$beatlines.$attr( "color", this.$this.$css( "--gsuiEnvelope-wave-col" ) );
	}

	// .........................................................................
	$startKey( id, bpm, dur = null ) {
		if ( GSUdomHasAttr( this, "toggle" ) ) {
			const el = GSUcreateDiv( { style: { left: 0, top: "100%" } } );

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
				p.$dur = ( Date.now() / 1000 - p.$when ) * p.$bps;
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
		const g = this.$elements.$graph.$at( 0 );
		const x = gsuiEnvelope.#keyPreviewCalcX( since, p.$dur, g, this.#dur );

		if ( x > 1 ) {
			p.$elem.remove();
			toRm.push( p );
		} else {
			const y = gsuiEnvelope.#keyPreviewCalcY( since, p.$dur, g );
			const y2 = 1 - y * Math.abs( g.$amp );

			GSUdomStyle( p.$elem, {
				top: `${ y2 * 100 }%`,
				left: `${ x * 100 }%`,
			} );
		}
	}
	static #keyPreviewCalcX( since, dur, g, graphDur ) {
		const ahd = g.$attack + g.$hold + g.$decay;

		if ( since < ahd && since < dur ) {
			return since / graphDur;
		}
		if ( since < dur ) {
			const dur2 = dur === Infinity ? since + 1 : dur;
			const a = ahd / graphDur;
			const t = ( since - ahd ) / ( dur2 - ahd );
			const susDur = ( graphDur - ahd - g.$release ) / graphDur;

			return a + Math.min( t, 1 ) * susDur;
		}
		return ( 1 - g.$release / graphDur ) + ( since - dur ) / graphDur;
	}
	static #keyPreviewCalcY( since, dur, g ) {
		if ( since < dur ) {
			if ( since < g.$attack ) {
				return since / g.$attack;
			}
			if ( since < g.$attack + g.$hold ) {
				return 1;
			}
			if ( since < g.$attack + g.$hold + g.$decay ) {
				return 1 - ( since - g.$attack - g.$hold ) / g.$decay * ( 1 - g.$sustain );
			}
			return g.$sustain;
		}
		return ( 1 - ( since - dur ) / g.$release ) * g.$sustain;
	}
}

GSUdomDefine( "gsui-envelope", gsuiEnvelope );
