"use strict";

class gsuiTimeline extends gsui0ne {
	#status = "";
	#step = 1;
	#beatsPerMeasure = 4;
	#stepsPerBeat = 4;
	#pxPerBeat = 10;
	#pxPerMeasure = this.#beatsPerMeasure * this.#pxPerBeat;
	#loopA = 0;
	#loopB = 0;
	#looping = false;
	#offset = null;
	#scrollingAncestor = document.body;
	#mousedownLoop = "";
	#onlyBigMeasures = false;
	#mousedownPrevX = 0;
	#mousedownPrevDate = 0;
	#mousemoveBeat = 0;
	#mousedownBeat = 0;
	#mousedownLoopA = 0;
	#mousedownLoopB = 0;
	#onscrollBind = this.#onscroll.bind( this );
	#onresizeBind = this.#onresize.bind( this );

	constructor() {
		super( {
			$cmpName: "gsuiTimeline",
			$tagName: "gsui-timeline",
			$elements: {
				$steps: ".gsuiTimeline-steps",
				$beats: ".gsuiTimeline-beats",
				$measures: ".gsuiTimeline-measures",
				$loop: ".gsuiTimeline-loop",
				$cursor: ".gsuiTimeline-cursor",
				$cursorPreview: ".gsuiTimeline-cursorPreview",
			},
			$attributes: {
				step: 1,
				currenttime: 0,
			},
		} );
		Object.seal( this );
	}

	static $numbering( from ) {
		GSUsetStyle( document.body, "--gsuiTimeline-numbering", +from );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.#updateOffset();
		this.#updateNumberMeasures();
		this.#updateMeasures();
		this.$elements.$cursorPreview.remove();
	}
	$disconnected() {
		this.#unscrollEvent();
	}
	static get observedAttributes() {
		return [ "step", "timedivision", "pxperbeat", "loop", "currenttime", "currenttime-preview" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "step": this.#step = +val; break;
			case "loop": this.#changeLoop( val ); break;
			case "pxperbeat": this.#changePxPerBeat( +val ); break;
			case "currenttime": this.#changeCurrentTime( +val ); break;
			case "timedivision": this.#changeTimedivision( val ); break;
			case "currenttime-preview": this.#changeCurrentTimePreview( val === null ? null : +val ); break;
		}
	}

	// .........................................................................
	$setScrollingParent( el ) {
		this.#unscrollEvent();
		this.#scrollingAncestor = el;
		el.addEventListener( "scroll", this.#onscrollBind );
		GSUobserveSizeOf( el, this.#onresizeBind );
	}
	#unscrollEvent() {
		if ( this.#scrollingAncestor ) {
			this.#scrollingAncestor.removeEventListener( "scroll", this.#onscrollBind );
			GSUunobserveSizeOf( this.#scrollingAncestor, this.#onresizeBind );
		}
	}

	// .........................................................................
	$beatCeil( beat ) { return this.#beatCalc( Math.ceil, beat ); }
	$beatRound( beat ) { return this.#beatCalc( Math.round, beat ); }
	$beatFloor( beat ) { return this.#beatCalc( Math.floor, beat ); }
	#beatCalc( mathFn, beat ) {
		const mod = 1 / this.#stepsPerBeat * this.#step;

		return mathFn( beat / mod ) * mod;
	}

	// .........................................................................
	#changePxPerBeat( ppb ) {
		const stepsOpa = Math.max( 0, Math.min( ( ppb - 32 ) / 256, .5 ) );
		const beatsOpa = Math.max( 0, Math.min( ( ppb - 20 ) / 40, .6 ) );
		const measuresOpa = Math.max( 0, Math.min( ( ppb - 6 ) / 20, .7 ) );

		this.#pxPerBeat = ppb;
		this.#pxPerMeasure = this.#beatsPerMeasure * ppb;
		this.#onlyBigMeasures = ppb < 6;
		GSUsetStyle( this, {
			fontSize: `${ ppb }px`,
			"--gsuiTimeline-beats-incr": this.#onlyBigMeasures ? this.#beatsPerMeasure : 1,
			"--gsuiTimeline-measures-opacity": measuresOpa,
		} );
		this.$elements.$steps.style.opacity = stepsOpa;
		this.$elements.$beats.style.opacity = beatsOpa;
		this.#updateOffset();
		this.#updateNumberMeasures();
		this.#updateMeasures();
	}
	#changeTimedivision( timediv ) {
		const [ bPM, sPB ] = timediv.split( "/" );

		this.#beatsPerMeasure = +bPM;
		this.#stepsPerBeat = +sPB;
		this.#pxPerMeasure = this.#beatsPerMeasure * this.#pxPerBeat;
		GSUsetStyle( this, "--gsuiTimeline-beats-per-measure", this.#beatsPerMeasure );
		this.#updateStepsBg();
		if ( this.#scrollingAncestor ) {
			this.#updateNumberMeasures();
			this.#updateMeasures();
		}
	}
	#changeLoop( val ) {
		const [ a, b ] = ( val || "0-0" ).split( "-" );

		this.#looping = !!val;
		this.#loopA = +a;
		this.#loopB = +b;
		this.#updateLoop();
	}
	#changeCurrentTime( t ) {
		this.$elements.$cursor.style.left = `${ t }em`;
	}
	#changeCurrentTimePreview( t ) {
		if ( t === null ) {
			this.$elements.$cursorPreview.remove();
		} else {
			const rnd = this.$beatRound( t );

			if ( t.toFixed( 3 ) !== rnd.toFixed( 3 ) ) {
				GSUsetAttribute( this, "currenttime-preview", rnd );
			} else {
				this.$elements.$cursorPreview.style.left = `${ t }em`;
				if ( !this.$elements.$cursorPreview.parentNode ) {
					this.append( this.$elements.$cursorPreview );
				}
			}
		}
	}

	// .........................................................................
	#setStatus( st ) {
		this.#status = st;
		GSUsetAttribute( this, "status", st );
	}
	#getBeatByPageX( pageX ) {
		const bcrX = this.getBoundingClientRect().x;

		return Math.max( 0, this.$beatRound( ( pageX - bcrX ) / this.#pxPerBeat ) );
	}
	#updateStepsBg() {
		const sPB = this.#stepsPerBeat;
		const dots = [];

		for ( let i = 1; i < sPB; ++i ) {
			dots.push(
				`transparent calc( ${ i / sPB }em - 1px )`,
				`currentColor calc( ${ i / sPB }em - 1px )`,
				`currentColor calc( ${ i / sPB }em + 1px )`,
				`transparent calc( ${ i / sPB }em + 1px )` );
		}
		this.$elements.$steps.style.backgroundImage = `
			repeating-linear-gradient(90deg, transparent 0em,
				${ dots.join( "," ) },
				transparent calc( ${ 1 }em )
			)
		`;
	}
	#updateOffset() {
		const offBeats = Math.floor( this.#scrollingAncestor.scrollLeft / this.#pxPerMeasure );
		const off = this.#onlyBigMeasures
			? Math.floor( offBeats / this.#beatsPerMeasure ) * this.#beatsPerMeasure
			: offBeats;
		const diff = off !== this.#offset;

		if ( diff ) {
			this.#offset = off;
			GSUsetStyle( this, "--gsuiTimeline-beats-offset", off );
		}
		return diff;
	}
	#updateNumberMeasures() {
		const elMeasures = this.$elements.$measures;
		const px = this.#pxPerMeasure * ( this.#onlyBigMeasures ? this.#beatsPerMeasure : 1 );
		const nb = Math.ceil( this.#scrollingAncestor.clientWidth / px ) + 1;

		if ( nb < 0 || nb > 500 ) {
			return console.warn( "gsuiTimeline: anormal number of nodes to create", nb );
		} else if ( elMeasures.children.length > nb ) {
			while ( elMeasures.children.length > nb ) {
				elMeasures.lastChild.remove();
			}
		} else {
			while ( elMeasures.children.length < nb ) {
				elMeasures.append( GSUcreateSpan( { class: "gsuiTimeline-measure" } ) );
			}
		}
	}
	#updateMeasures() {
		Array.prototype.forEach.call( this.$elements.$measures.children, ( el, i ) => {
			el.classList.toggle( "gsuiTimeline-measureBig",
				this.#onlyBigMeasures || ( this.#offset + i ) % this.#beatsPerMeasure === 0 );
		} );
	}
	#updateLoop() {
		this.classList.toggle( "gsuiTimeline-looping", this.#looping );
		if ( this.#looping ) {
			this.$elements.$loop.style.left = `${ this.#loopA }em`;
			this.$elements.$loop.style.width = `${ this.#loopB - this.#loopA }em`;
		}
	}

	// .........................................................................
	#onscroll() {
		if ( this.#updateOffset() && !this.#onlyBigMeasures ) {
			this.#updateMeasures();
		}
	}
	#onresize() {
		this.#updateNumberMeasures();
		this.#updateMeasures();
	}
	$onptrdown( e ) {
		this.#mousemoveBeat = null;
		this.#mousedownBeat = this.#getBeatByPageX( e.pageX );
		if ( e.button === 2 || (
			Date.now() - this.#mousedownPrevDate < 500 &&
			GSUMathApprox( this.#mousedownPrevX, e.pageX, 20 )
		) ) {
			if ( e.button !== 2 || !this.#looping ) {
				this.#loopA =
				this.#loopB = this.#mousedownBeat;
				this.$dispatch( "inputLoopStart" );
				this.#setStatus( "draggingLoopHandleB" );
			} else if ( e.button === 2 && this.#looping ) {
				if ( this.#mousedownBeat < ( this.#loopB + this.#loopA ) / 2 ) {
					this.#loopA = this.#mousedownBeat;
					this.#setStatus( "draggingLoopHandleA" );
				} else {
					this.#loopB = this.#mousedownBeat;
					this.#setStatus( "draggingLoopHandleB" );
				}
			}
		} else {
			this.#mousedownPrevX = e.pageX;
			this.#mousedownPrevDate = Date.now();
			this.#setStatus(
				e.target === this.$elements.$cursor.parentNode ? "draggingTime" :
				e.target.classList.contains( "gsuiTimeline-loopBody" ) ? "draggingLoopBody" :
				e.target.classList.contains( "gsuiTimeline-loopHandleA" ) ? "draggingLoopHandleA" :
				e.target.classList.contains( "gsuiTimeline-loopHandleB" ) ? "draggingLoopHandleB" : "" );
		}
		if ( this.#status ) {
			this.$dispatch( "inputCurrentTimeStart" );
			this.#mousedownLoop = GSUgetAttribute( this, "loop" );
			this.#mousedownLoopA = this.#loopA;
			this.#mousedownLoopB = this.#loopB;
			GSUunselectText();
			this.$onptrmove( e );
			return;
		}
		return false;
	}
	$onptrmove( e ) {
		const beat = this.#getBeatByPageX( e.pageX );
		const beatRel = beat - this.#mousedownBeat;

		if ( beatRel !== this.#mousemoveBeat ) {
			this.#mousemoveBeat = beatRel;
			switch ( this.#status ) {
				case "draggingTime":
					GSUsetAttribute( this, "currenttime-preview", beat );
					this.$dispatch( "inputCurrentTime", beat );
					break;
				case "draggingLoopBody": {
					const rel = Math.max( -this.#mousedownLoopA, beatRel );
					const a = this.#mousedownLoopA + rel;
					const b = this.#mousedownLoopB + rel;
					const loop = `${ a }-${ b }`;

					if ( loop !== GSUgetAttribute( this, "loop" ) ) {
						GSUsetAttribute( this, "loop", loop );
						this.$dispatch( "inputLoop", a, b );
					}
				} break;
				case "draggingLoopHandleA":
				case "draggingLoopHandleB": {
					const handA = this.#status === "draggingLoopHandleA";
					const rel = handA
						? Math.max( -this.#mousedownLoopA, beatRel )
						: beatRel;
					const a = this.#mousedownLoopA + ( handA ? rel : 0 );
					const b = this.#mousedownLoopB + ( handA ? 0 : rel );
					const aa = Math.min( a, b );
					const bb = Math.max( a, b );
					const loop = `${ aa }-${ bb }`;

					if ( a > b ) {
						if ( handA ) {
							this.#setStatus( "draggingLoopHandleB" );
							this.#mousedownLoopA = this.#mousedownLoopB;
						} else {
							this.#setStatus( "draggingLoopHandleA" );
							this.#mousedownLoopB = this.#mousedownLoopA;
						}
						this.#mousedownBeat = this.#mousedownLoopA;
					}
					if ( loop !== GSUgetAttribute( this, "loop" ) ) {
						if ( aa !== bb ) {
							GSUsetAttribute( this, "loop", loop );
							this.$dispatch( "inputLoop", aa, bb );
						} else if ( this.hasAttribute( "loop" ) ) {
							this.removeAttribute( "loop" );
							this.$dispatch( "inputLoop", false );
						}
					}
				} break;
			}
		}
	}
	$onptrup( e ) {
		switch ( this.#status ) {
			case "draggingTime": {
				const beat = GSUgetAttribute( this, "currenttime-preview" );

				this.removeAttribute( "currenttime-preview" );
				this.$dispatch( "inputCurrentTimeEnd" );
				if ( beat !== GSUgetAttribute( this, "currenttime" ) ) {
					GSUsetAttribute( this, "currenttime", beat );
					this.$dispatch( "changeCurrentTime", +beat );
				}
			} break;
			case "draggingLoopBody":
			case "draggingLoopHandleA":
			case "draggingLoopHandleB":
				this.$dispatch( "inputLoopEnd" );
				if ( GSUgetAttribute( this, "loop" ) !== this.#mousedownLoop ) {
					if ( this.#loopA !== this.#loopB ) {
						this.$dispatch( "changeLoop", this.#loopA, this.#loopB );
					} else {
						this.removeAttribute( "loop" );
						this.$dispatch( "changeLoop", false );
					}
				}
				break;
		}
		this.#setStatus( "" );
	}
}

GSUdefineElement( "gsui-timeline", gsuiTimeline );
