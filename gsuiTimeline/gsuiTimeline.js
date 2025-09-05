"use strict";

const GSUI_DRAGGING_TIME = "dragTime";
const GSUI_DRAGGING_LOOP = "dragLoop";
const GSUI_DRAGGING_LOOP_A = "dragLoopA";
const GSUI_DRAGGING_LOOP_B = "dragLoopB";

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
	#maxDuration = Infinity;
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
	$connected() {
		this.#setScrollingParent( GSUdomClosestScrollable( this ) );
	}
	$disconnected() {
		this.#unscrollEvent( this.#scrollingAncestor );
	}
	static get observedAttributes() {
		return [ "step", "timedivision", "pxperbeat", "loop", "maxduration", "currenttime", "currenttime-preview" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "step": this.#step = +val; break;
			case "loop": this.#changeLoop( val ); break;
			case "pxperbeat": this.#changePxPerBeat( +val ); break;
			case "maxduration": this.#maxDuration = +val || Infinity; break;
			case "currenttime": this.#changeCurrentTime( +val ); break;
			case "timedivision": this.#changeTimedivision( val ); break;
			case "currenttime-preview": this.#changeCurrentTimePreview( val === null ? null : +val ); break;
		}
	}

	// .........................................................................
	#setScrollingParent( el ) {
		this.#unscrollEvent( this.#scrollingAncestor );
		if ( el ) {
			this.#scrollingAncestor = el;
			el.addEventListener( "scroll", this.#onscrollBind );
			GSUobserveSizeOf( el, this.#onresizeBind );
		}
	}
	#unscrollEvent( el ) {
		if ( el ) {
			el.removeEventListener( "scroll", this.#onscrollBind );
			GSUunobserveSizeOf( el, this.#onresizeBind );
		}
		this.#scrollingAncestor = null;
	}

	// .........................................................................
	$beatCeil(  beat ) { return GSUmathCeil(  beat, 1 / this.#stepsPerBeat * this.#step ); }
	$beatRound( beat ) { return GSUmathRound( beat, 1 / this.#stepsPerBeat * this.#step ); }
	$beatFloor( beat ) { return GSUmathFloor( beat, 1 / this.#stepsPerBeat * this.#step ); }

	// .........................................................................
	#changePxPerBeat( ppb ) {
		const stepsOpa = GSUmathClamp( ( ppb - 32 ) / 256, 0, .5 );
		const beatsOpa = GSUmathClamp( ( ppb - 20 ) /  40, 0, .6 );
		const measuOpa = GSUmathClamp( ( ppb -  6 ) /  20, 0, .7 );

		this.#pxPerBeat = ppb;
		this.#pxPerMeasure = this.#beatsPerMeasure * ppb;
		this.#onlyBigMeasures = ppb < 6;
		GSUsetStyle( this, {
			fontSize: `${ ppb }px`,
			"--gsuiTimeline-beats-incr": this.#onlyBigMeasures ? this.#beatsPerMeasure : 1,
			"--gsuiTimeline-measures-opacity": measuOpa,
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
				GSUdomSetAttr( this, "currenttime-preview", rnd );
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
		GSUdomSetAttr( this, "status", st );
	}
	#getBeatByPageX( pageX ) {
		return GSUmathClamp( this.$beatRound( ( pageX - GSUdomBCRxy( this )[ 0 ] ) / this.#pxPerBeat ), 0, this.#maxDuration );
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
		const scrollX = this.#scrollingAncestor?.scrollLeft || 0;
		const offBeats = Math.floor( scrollX / this.#pxPerMeasure );
		const off = this.#onlyBigMeasures
			? GSUmathFloor( offBeats, this.#beatsPerMeasure )
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
		const w = this.#scrollingAncestor?.clientWidth || this.clientWidth;
		const nb = Math.ceil( w / px ) + 1 || 0;

		if ( !GSUmathInRange( nb, 0, 500 ) ) {
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
			GSUdomSetAttr( el, "data-hl", this.#onlyBigMeasures || ( this.#offset + i ) % this.#beatsPerMeasure === 0 );
		} );
	}
	#updateLoop() {
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
			GSUmathApprox( this.#mousedownPrevX, e.pageX, 20 )
		) ) {
			if ( e.button !== 2 || !this.#looping ) {
				this.#loopA =
				this.#loopB = this.#mousedownBeat;
				GSUdomDispatch( this, GSEV_TIMELINE_INPUTLOOPSTART );
				this.#setStatus( GSUI_DRAGGING_LOOP_B );
			} else if ( e.button === 2 && this.#looping ) {
				if ( this.#mousedownBeat < ( this.#loopB + this.#loopA ) / 2 ) {
					this.#loopA = this.#mousedownBeat;
					this.#setStatus( GSUI_DRAGGING_LOOP_A );
				} else {
					this.#loopB = this.#mousedownBeat;
					this.#setStatus( GSUI_DRAGGING_LOOP_B );
				}
			}
		} else {
			this.#mousedownPrevX = e.pageX;
			this.#mousedownPrevDate = Date.now();
			this.#setStatus(
				e.target === this.$elements.$cursor.parentNode ? GSUI_DRAGGING_TIME :
				GSUdomHasClass( e.target, "gsuiTimeline-loopBody" ) ? GSUI_DRAGGING_LOOP :
				GSUdomHasClass( e.target, "gsuiTimeline-loopHandleA" ) ? GSUI_DRAGGING_LOOP_A :
				GSUdomHasClass( e.target, "gsuiTimeline-loopHandleB" ) ? GSUI_DRAGGING_LOOP_B : "" );
		}
		if ( this.#status ) {
			GSUdomDispatch( this, GSEV_TIMELINE_INPUTCURRENTTIMESTART );
			this.#mousedownLoop = GSUdomGetAttr( this, "loop" );
			this.#mousedownLoopA = this.#loopA;
			this.#mousedownLoopB = this.#loopB;
			GSUdomUnselect();
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
				case GSUI_DRAGGING_TIME:
					GSUdomSetAttr( this, "currenttime-preview", beat );
					GSUdomDispatch( this, GSEV_TIMELINE_INPUTCURRENTTIME, beat );
					break;
				case GSUI_DRAGGING_LOOP: {
					const rel = GSUmathClamp( beatRel, -this.#mousedownLoopA, this.#maxDuration - this.#mousedownLoopB );
					const a = this.#mousedownLoopA + rel;
					const b = this.#mousedownLoopB + rel;
					const loop = `${ a }-${ b }`;

					if ( loop !== GSUdomGetAttr( this, "loop" ) ) {
						GSUdomSetAttr( this, "loop", loop );
						GSUdomDispatch( this, GSEV_TIMELINE_INPUTLOOP, a, b );
					}
				} break;
				case GSUI_DRAGGING_LOOP_A:
				case GSUI_DRAGGING_LOOP_B: {
					const handA = this.#status === GSUI_DRAGGING_LOOP_A;
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
							this.#setStatus( GSUI_DRAGGING_LOOP_B );
							this.#mousedownLoopA = this.#mousedownLoopB;
						} else {
							this.#setStatus( GSUI_DRAGGING_LOOP_A );
							this.#mousedownLoopB = this.#mousedownLoopA;
						}
						this.#mousedownBeat = this.#mousedownLoopA;
					}
					if ( loop !== GSUdomGetAttr( this, "loop" ) ) {
						if ( aa !== bb ) {
							GSUdomSetAttr( this, "loop", loop );
							GSUdomDispatch( this, GSEV_TIMELINE_INPUTLOOP, aa, bb );
						} else if ( this.hasAttribute( "loop" ) ) {
							GSUdomRmAttr( this, "loop" );
							GSUdomDispatch( this, GSEV_TIMELINE_INPUTLOOP, false );
						}
					}
				} break;
			}
		}
	}
	$onptrup( e ) {
		switch ( this.#status ) {
			case GSUI_DRAGGING_TIME: {
				const beat = GSUdomGetAttr( this, "currenttime-preview" );

				GSUdomRmAttr( this, "currenttime-preview" );
				GSUdomDispatch( this, GSEV_TIMELINE_INPUTCURRENTTIMEEND );
				if ( beat !== GSUdomGetAttr( this, "currenttime" ) ) {
					GSUdomSetAttr( this, "currenttime", beat );
					GSUdomDispatch( this, GSEV_TIMELINE_CHANGECURRENTTIME, +beat );
				}
			} break;
			case GSUI_DRAGGING_LOOP:
			case GSUI_DRAGGING_LOOP_A:
			case GSUI_DRAGGING_LOOP_B:
				GSUdomDispatch( this, GSEV_TIMELINE_INPUTLOOPEND );
				if ( GSUdomGetAttr( this, "loop" ) !== this.#mousedownLoop ) {
					if ( this.#loopA !== this.#loopB ) {
						GSUdomDispatch( this, GSEV_TIMELINE_CHANGELOOP, this.#loopA, this.#loopB );
					} else {
						GSUdomRmAttr( this, "loop" );
						GSUdomDispatch( this, GSEV_TIMELINE_CHANGELOOP, false );
					}
				}
				break;
		}
		this.#setStatus( "" );
	}
}

GSUdomDefine( "gsui-timeline", gsuiTimeline );
