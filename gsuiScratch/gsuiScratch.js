"use strict";

class gsuiScratch extends gsui0ne {
	#audioElem = null;
	#audioElemRev = null;
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
			// $ptrlock: true,
			$elements: {
				$svg: "svg",
				$polygon: "polygon",
			},
		} );
	}

	// .........................................................................
	$onresize( w, h ) {
		this.#w = w;
		this.#h = h;
		this.#wSec = w / 100;
		this.#drawWaveform();
	}
	static get observedAttributes() {
		return [ "xxxxxxxxxxxx" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "xxxxxxxxxxxx":
				break;
		}
	}
	$onmessage( ev, val ) {
		switch ( ev ) {
			case GSEV_SCRATCH_LOAD: this.#load( val ); break;
			case GSEV_SCRATCH_AUDIOELEMENT:
				this.#audioElem = val;
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
		const elem = pb < 0 ? this.#audioElemRev : this.#audioElem;

		if ( this.#ptrSpeedB < 0 !== this.#ptrSpeedA < 0 ) {
			if ( pb > 0 ) {
				this.#audioElem.currentTime = this.#dur - this.#audioElemRev.currentTime;
				this.#audioElemRev.playbackRate = 0;
			} else {
				this.#audioElemRev.currentTime = this.#dur - this.#audioElem.currentTime;
				this.#audioElem.playbackRate = 0;
			}
		}
		elem.playbackRate = GSUmathClamp( Math.abs( pb ), .065, 4 );
		this.#ptrSpeedB = pb;
	}
	#frame() {
		if ( this.$isActive ) {
			this.#ptrSpeedA /= 1.2;
		} else {
			this.#ptrSpeedA += ( 1 - this.#ptrSpeedA ) / 40;
		}
		if ( this.#audioElem.paused !== this.#audioElemRev.paused ) {
			this.#audioElem.paused
				? this.#audioElemRev.pause()
				: this.#audioElemRev.play();
		}
		this.#setPBR( this.#ptrSpeedA );
		this.#currentTime = this.#audioElem.playbackRate > 0
			? this.#audioElem.currentTime
			: this.#dur - this.#audioElemRev.currentTime;
		this.#drawWaveform();
	}
	#load( url ) {
		this.#audiobuf = null;
		this.#currentTime = 0;
		return fetch( url )
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
				this.#audioElemRev = audioRev.$get( 0 );
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
