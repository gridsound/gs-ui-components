"use strict";

class gsuiScratch extends gsui0ne {
	#audioElem = $noop;
	#audioElemRev = $noop;
	#audiobuf = null;
	#audiobufURL = null;
	#dur = 0;
	#intervalId = null;
	#frameBind = this.#frame.bind( this );
	#ptrSpeedA = 1;
	#ptrSpeedB = 1;
	#currentTime = 0;
	#w = 0;
	#h = 0;
	#wSec = 1;

	constructor() {
		super( {
			$tagName: "gsui-scratch",
			$template: $.$elem( "gsui-scratch-in", { inert: true },
				$.$elem( "svg", { preserveAspectRatio: "none" },
					$.$elem( "polygon" ),
				),
				$.$elem( "gsui-scratch-0line" ),
				$.$elem( "gsui-scratch-timeline" ),
			),
			$elements: {
				$svg: "svg",
				$polygon: "polygon",
			},
		} );
	}

	// .........................................................................
	$disconnected() {
		GSUclearInterval( this.#intervalId );
		URL.revokeObjectURL( this.#audiobufURL );
		this.#audiobuf =
		this.#intervalId =
		this.#audiobufURL = null;
		this.#audioElemRev.$rmAttr( "src" );
		this.#audioElemRev.$remove();
		this.#audioElem =
		this.#audioElemRev = $noop;
	}
	$onresize( w, h ) {
		this.#w = w;
		this.#h = h;
		this.#wSec = w / 100;
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
	$onptrdown( e ) {
		this.$this.$css( "cursor", "var(--gsuiCursor-grabbing)" );
	}
	$onptrmove( e ) {
		this.#ptrSpeedA -= e.movementX / 16;
	}
	$onptrup( e ) {
		this.$this.$css( "cursor", "" );
	}

	// .........................................................................
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
		if ( this.$isActive ) {
			this.#ptrSpeedA /= 1.2;
		} else {
			this.#ptrSpeedA += ( 1 - this.#ptrSpeedA ) / 40;
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
		this.#audiobuf = null;
		this.#audioElem = elAudio;
		this.#currentTime = 0;
		return fetch( elAudio.$prop( "src" ) )
			.then( res => res.arrayBuffer() )
			.then( arr => GSUaudioCurrentContext.decodeAudioData( arr ) )
			.then( buf => {
				const bufRev = GSUreverseBuffer( GSUcloneBuffer( GSUaudioCurrentContext, buf ) );
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
