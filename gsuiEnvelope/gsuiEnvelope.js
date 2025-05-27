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
			$elements: {
				$beatlines: "gsui-beatlines",
				$graph: "gsui-envelope-graph",
				$keyPreviews: ".gsuiEnvelope-keyPreviews",
				$sliders: {
					amp:     [ ".gsuiEnvelope-prop[data-prop='amp']     gsui-slider", ".gsuiEnvelope-prop[data-prop='amp']     .gsuiEnvelope-propValue" ],
					q:       [ ".gsuiEnvelope-prop[data-prop='q']       gsui-slider", ".gsuiEnvelope-prop[data-prop='q']       .gsuiEnvelope-propValue" ],
					attack:  [ ".gsuiEnvelope-prop[data-prop='attack']  gsui-slider", ".gsuiEnvelope-prop[data-prop='attack']  .gsuiEnvelope-propValue" ],
					hold:    [ ".gsuiEnvelope-prop[data-prop='hold']    gsui-slider", ".gsuiEnvelope-prop[data-prop='hold']    .gsuiEnvelope-propValue" ],
					decay:   [ ".gsuiEnvelope-prop[data-prop='decay']   gsui-slider", ".gsuiEnvelope-prop[data-prop='decay']   .gsuiEnvelope-propValue" ],
					sustain: [ ".gsuiEnvelope-prop[data-prop='sustain'] gsui-slider", ".gsuiEnvelope-prop[data-prop='sustain'] .gsuiEnvelope-propValue" ],
					release: [ ".gsuiEnvelope-prop[data-prop='release'] gsui-slider", ".gsuiEnvelope-prop[data-prop='release'] .gsuiEnvelope-propValue" ],
				},
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
				break;
			case "toggle": this.#changeToggle( val !== null ); break;
			case "timedivision": this.#changeTimedivision( val ); break;
			case "amp":
			case "q":
			case "attack":
			case "hold":
			case "decay":
			case "sustain":
			case "release":
				this.#changeProp( prop, +val );
				break;
		}
	}

	// .........................................................................
	$updateWave( prop, val ) {
		const g = this.$elements.$graph;
		const amp = prop === "amp" ? val : GSUgetAttributeNum( this, "amp" );
		const amp2 = this.#env === "detune" ? amp / 24 : 1;

		g.$amp = amp2;
		g.$attack = prop === "attack" ? val : GSUgetAttributeNum( this, "attack" );
		g.$hold = prop === "hold" ? val : GSUgetAttributeNum( this, "hold" );
		g.$decay = prop === "decay" ? val : GSUgetAttributeNum( this, "decay" );
		g.$sustain = prop === "sustain" ? val : GSUgetAttributeNum( this, "sustain" );
		g.$release = prop === "release" ? val : GSUgetAttributeNum( this, "release" );
		g.$duration =
		this.#dur = Math.max( g.$attack + g.$hold + g.$decay + .5 + g.$release, 2 );
		g.$draw();
		this.#updatePxPerBeat();
	}

	// .........................................................................
	#changeToggle( b ) {
		GSUsetAttribute( this.$elements.$sliders.amp[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.q[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.attack[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.hold[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.decay[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.sustain[ 0 ], "disabled", !b );
		GSUsetAttribute( this.$elements.$sliders.release[ 0 ], "disabled", !b );
	}
	#changeTimedivision( val ) {
		GSUsetAttribute( this.$elements.$beatlines, "timedivision", val );
		this.$updateWave();
	}
	#changeProp( prop, val ) {
		const [ sli, span ] = this.$elements.$sliders[ prop ];

		GSUsetAttribute( sli, "value", val );
		span.textContent = gsuiEnvelope.#formatValue( prop, val );
	}
	#updatePxPerBeat() {
		this.#ppb = this.#waveWidth / this.#dur;
		GSUsetAttribute( this.$elements.$beatlines, "pxperbeat", this.#ppb );
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
		this.#waveWidth = this.$elements.$beatlines.getBoundingClientRect().width;
		this.#updatePxPerBeat();
		this.$elements.$graph.$resized();
	}
	#oninputSlider( prop, val ) {
		this.$elements.$sliders[ prop ][ 1 ].textContent = gsuiEnvelope.#formatValue( prop, val );
		this.$updateWave( prop, val );
		this.$dispatch( "liveChange", this.#env, prop, val );
	}
	#onchangeSlider( prop, val ) {
		GSUsetAttribute( this, prop, val );
		this.$dispatch( "change", this.#env, prop, val );
	}

	// .........................................................................
	$startKey( id, bpm, dur = null ) {
		if ( GSUhasAttribute( this, "toggle" ) ) {
			const el = GSUcreateDiv( { class: "gsuiEnvelope-keyPreview", style: { left: 0, top: "100%" } } );

			this.#keyPreviews.push( {
				$id: id,
				$bps: bpm / 60,
				$dur: dur ?? Infinity,
				$elem: el,
				$when: Date.now() / 1000,
			} );
			this.$elements.$keyPreviews.append( el );
			if ( !this.#keyAnimId ) {
				this.#keyAnimId = setInterval( this.#keyAnimFrame.bind( this ), 1000 / 60 );
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
				clearInterval( this.#keyAnimId );
				this.#keyAnimId = null;
			}
		}
	}
	#keyAnimFramePreview( toRm, now, p ) {
		const since = ( now - p.$when ) * p.$bps;
		const g = this.$elements.$graph;
		const x = gsuiEnvelope.#keyPreviewCalcX( since, p.$dur, g, this.#dur );

		if ( x > 1 ) {
			p.$elem.remove();
			toRm.push( p );
		} else {
			const y = gsuiEnvelope.#keyPreviewCalcY( since, p.$dur, g );
			const y2 = 1 - y * Math.abs( g.$amp );

			GSUsetStyle( p.$elem, {
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

GSUdefineElement( "gsui-envelope", gsuiEnvelope );
