"use strict";

class gsuiScratch extends gsui0ne {
	#audioElem = $noop;
	#audioElemRev = $noop;
	#audiobuf = null;
	#audiobufURL = null;
	#bpm = 60;
	#dur = 0;
	#clicked = false;
	#intervalId = null;
	#frameBind = this.#frame.bind( this );
	#ptrSpeedA = 1;
	#ptrSpeedB = 1;
	#currentTime = 0;
	#w = 0;
	#h = 0;
	#wSec = 1;
	#speed = 1;

	constructor() {
		super( {
			$tagName: "gsui-scratch",
			$template: $.$elem( "gsui-scratch-in", null,
				$.$elem( "gsui-scratch-speed", null,
					$.$elem( "gsui-scratch-speed-slider", null,
						$.$elem( "gsui-slider", { type: "circular", min: -4, max: 4, value: 1, defaultValue: 1, step: .001, "stroke-width": 8, "mousemove-size": 800 } ),
					),
					$.$span(),
				),
				$.$elem( "gsui-scratch-graph", null,
					$.$elem( "svg", { preserveAspectRatio: "none", inert: true },
						$.$elem( "polygon" ),
					),
					$.$span( { inert: true }, GSTX.$loading ),
					$.$elem( "gsui-scratch-0line", { inert: true } ),
					$.$elem( "gsui-scratch-timeline", { inert: true } ),
				),
				$.$button( { "data-action": "close" },
					$.$icon( { icon: "close" } ),
				),
			),
			$elements: {
				$graph: "gsui-scratch-graph",
				$bpmSlider: "gsui-scratch-speed gsui-slider",
				$bpmValue: "gsui-scratch-speed > span",
				$closeBtn: "[data-action=close]",
				$svg: "svg",
				$polygon: "polygon",
			},
		} );
		this.$elements.$bpmSlider.$listen( {
			[ GSEV_SLIDER_CHANGE ]: this.#onchangeSlider.bind( this ),
			[ GSEV_SLIDER_INPUT ]: this.#onchangeSlider.bind( this ),
		} );
		this.$elements.$closeBtn.$onclick( () => this.$this.$dispatch( GSEV_SCRATCH_CLOSE ) );
		this.$elements.$graph.$on( {
			pointerdown: e => {
				this.$elements.$graph
					.$setPtrCapture( e.pointerId )
					.$on( "pointermove", e => this.#ptrSpeedA -= e.movementX / 8 );
				this.$this.$css( "cursor", "var(--gsuiCursor-grabbing)" );
				this.#clicked = true;
			},
			pointerup: e => {
				this.#clicked = false;
				this.$elements.$graph
					.$relPtrCapture( e.pointerId )
					.$off( "pointermove" );
				this.$this.$css( "cursor", "" );
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "bpm" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "bpm":
				this.#bpm = +val;
				this.#updateBPM();
				break;
		}
	}
	$disconnected() {
		GSUclearInterval( this.#intervalId );
		URL.revokeObjectURL( this.#audiobufURL );
		this.#audiobuf =
		this.#intervalId =
		this.#audiobufURL = null;
		this.#clicked = false;
		this.#audioElemRev.$rmAttr( "src" );
		this.#audioElemRev.$remove();
		this.#audioElem =
		this.#audioElemRev = $noop;
	}
	$onresize() {
		const bcr = this.$elements.$graph.$bcr();

		this.#w = bcr.w;
		this.#h = bcr.h;
		this.#wSec = bcr.w / 100;
		this.#drawWaveform();
	}
	$onmessage( ev, val ) {
		switch ( ev ) {
			case GSEV_SCRATCH_LOAD:
				this.#load( val );
				break;
		}
	}

	// .........................................................................
	#onchangeSlider( _, val ) {
		this.#speed = val;
		this.#updateBPM();
	}
	#updateBPM() {
		this.$elements.$bpmValue.$text( this.#bpm * this.#speed | 0 );
	}
	#setPBR( pb ) {
		const elA = pb < 0 ? this.#audioElemRev : this.#audioElem;
		const elB = pb < 0 ? this.#audioElem : this.#audioElemRev;

		if ( this.#ptrSpeedB < 0 !== this.#ptrSpeedA < 0 ) {
			elA.$prop( "currentTime", this.#dur - elB.$prop( "currentTime" ) );
			elB.$prop( "playbackRate", 0 );
		}
		elA.$prop( "playbackRate", GSUmathClamp( Math.abs( pb ), .065, 4 ) );
		this.#ptrSpeedB = pb;
	}
	#frame() {
		if ( this.#clicked ) {
			this.#ptrSpeedA /= 1.2;
		} else {
			this.#ptrSpeedA += ( this.#speed - this.#ptrSpeedA ) / 10;
		}
		if ( this.#audioElem.$prop( "paused" ) !== this.#audioElemRev.$prop( "paused" ) ) {
			this.#audioElem.$prop( "paused" )
				? this.#audioElemRev.$pause()
				: this.#audioElemRev.$play();
		}
		this.#setPBR( this.#ptrSpeedA );
		this.#currentTime = this.#audioElem.$prop( "playbackRate" ) > 0
			? this.#audioElem.$prop( "currentTime" )
			: this.#dur - this.#audioElemRev.$prop( "currentTime" );
		this.#drawWaveform();
	}
	#load( elAudio ) {
		const ctx = GSUaudioContext();

		this.#audiobuf = null;
		this.#audioElem = elAudio;
		this.#currentTime = 0;
		this.$this.$addAttr( "loading" );
		return fetch( elAudio.$prop( "src" ) )
			.then( res => res.arrayBuffer() )
			.then( arr => ctx.decodeAudioData( arr ) )
			.then( buf => {
				const bufRev = GSUreverseBuffer( GSUcloneBuffer( ctx, buf ) );
				const blobRev = gswaEncodeWAV.$createBlob( gswaEncodeWAV.$encodeBuffer( {
					$buffer: bufRev,
					$float32: false,
				} ) );
				const urlRev = URL.createObjectURL( blobRev );
				const audioRev = $( "<audio>" )
					.$setAttr( "src", urlRev )
					.$prop( "preservesPitch", false )
					.$prop( "playbackRate", 0 )
					.$appendTo( this );

				this.#dur = buf.duration;
				this.#audiobuf = buf;
				this.#audiobufURL = urlRev;
				this.#audioElemRev = audioRev;
				this.#intervalId = GSUsetInterval( this.#frameBind, 1 / 60 );
				this.#drawWaveform();
			} )
			.finally( () => {
				ctx.close();
				this.$this.$rmAttr( "loading" );
			} );
	}
	#drawWaveform() {
		if ( this.#audiobuf ) {
			const t = this.#currentTime;
			const sec = this.#wSec;

			gsuiWaveform.$drawBuffer( this.$elements.$polygon, this.#w, this.#h, this.#audiobuf, t - sec / 2, sec );
		}
	}
}

$.$define( "gsui-scratch", gsuiScratch );
