"use strict";

class gsuiTimeline extends HTMLElement {
	constructor() {
		const children = GSUI.getTemplate( "gsui-timeline" ),
			elTimeLine = children[ 3 ];

		super();
		this._children = children;
		this.beatsPerMeasure = 4;
		this.stepsPerBeat = 4;
		this.pxPerBeat = 10;
		this.loopA =
		this.loopB = 0;
		this.looping = false;
		this._step = 1;
		this._onscroll = this._onscroll.bind( this );
		this._scrollingAncestor = null;
		this._elSteps = children[ 0 ];
		this._elBeats = children[ 1 ];
		this._elLoop = children[ 2 ].firstChild;
		this._elTimeLine = elTimeLine;
		this._elCursor = elTimeLine.firstChild;
		this._elCursorPreview = elTimeLine.lastChild;
		this._offset = null;
		this._mousedownDate =
		this._mousemoveBeat =
		this._mousedownBeat =
		this._mousedownLoopA =
		this._mousedownLoopB = 0;
		this._mousedownLoop = "";
		this._onlyMeasures = false;
		this._onmousemove = this._onmousemove.bind( this );
		this._onmouseup = this._onmouseup.bind( this );
		this._status = "";
		this._dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiTimeline" );
		this._onresize = this._onresize.bind( this );
		Object.seal( this );

		this._elCursorPreview.remove();
		this.onmousedown = this._onmousedown.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.classList.add( "gsuiTimeline" );
			this.append( ...this._children );
			this._children = null;
			if ( !this.hasAttribute( "step" ) ) {
				this.setAttribute( "step", 1 );
			}
		}
		this._scrollingAncestor = this._closestScrollingAncestor( this.parentNode );
		this._scrollingAncestor.addEventListener( "scroll", this._onscroll );
		GSUI.observeSizeOf( this._scrollingAncestor, this._onresize );
		this._updateOffset();
		this._updateNumberBeats();
		this._updateMeasures();
	}
	disconnectedCallback() {
		this._scrollingAncestor.removeEventListener( "scroll", this._onscroll );
		GSUI.unobserveSizeOf( this._scrollingAncestor, this._onresize );
	}
	static get observedAttributes() {
		return [ "step", "timesignature", "pxperbeat", "loop", "currenttime", "currenttime-preview" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "step": this._step = +val; break;
				case "loop": this._changeLoop( val ); break;
				case "pxperbeat": this._changePxPerBeat( +val ); break;
				case "currenttime": this._changeCurrentTime( +val ); break;
				case "timesignature": this._changeTimesignature( val ); break;
				case "currenttime-preview": this._changeCurrentTimePreview( val ); break;
			}
		}
	}

	// .........................................................................
	previewCurrentTime( b ) { // to remove...
		const ret = b !== false
				? this.beatRound( b )
				: +this.getAttribute( "currenttime-preview" ) || +this.getAttribute( "currenttime" ) || 0;

		b !== false
			? this.setAttribute( "currenttime-preview", ret )
			: this.removeAttribute( "currenttime-preview" );
		return ret;
	}
	_changePxPerBeat( ppb ) {
		const stepsOpa = Math.max( 0, Math.min( ( ppb - 32 ) / 256, .5 ) ),
			beatsOpa = Math.max( 0, Math.min( ( ppb - 20 ) / 40, .5 ) ),
			onlyM = ppb < 20;

		this.pxPerBeat = ppb;
		this._onlyMeasures = onlyM;
		this.style.fontSize = `${ ppb }px`;
		this.style.setProperty( "--gsuiTimeline-beats-incr", onlyM ? this.beatsPerMeasure : 1 );
		this.style.setProperty( "--gsuiTimeline-beats-opacity", beatsOpa );
		this._elSteps.style.opacity = stepsOpa;
		if ( this._scrollingAncestor ) {
			this._updateOffset();
			this._updateNumberBeats();
			this._updateMeasures();
		}
	}
	_changeTimesignature( val ) {
		const ts = val.split( "," );

		this.beatsPerMeasure = +ts[ 0 ];
		this.stepsPerBeat = +ts[ 1 ];
		this._updateStepsBg();
		this._updateMeasures();
	}
	_changeLoop( val ) {
		const [ a, b ] = ( val || "0-0" ).split( "-" );

		this.looping = !!val;
		this.loopA = +a;
		this.loopB = +b;
		this._updateLoop();
	}
	_changeCurrentTime( t ) {
		this._elCursor.style.left = `${ t }em`;
	}
	_changeCurrentTimePreview( t ) {
		if ( !t ) {
			this._elCursorPreview.remove();
		} else {
			this._elCursorPreview.style.left = `${ t }em`;
			if ( !this._elCursorPreview.parentNode ) {
				this._elTimeLine.append( this._elCursorPreview );
			}
		}
	}

	// .........................................................................
	beatCeil( beat ) { return this._beatCalc( Math.ceil, beat ); }
	beatRound( beat ) { return this._beatCalc( Math.round, beat ); }
	beatFloor( beat ) { return this._beatCalc( Math.floor, beat ); }
	_beatCalc( mathFn, beat ) {
		const mod = 1 / this.stepsPerBeat * this._step;

		return mathFn( beat / mod ) * mod;
	}

	// .........................................................................
	_closestScrollingAncestor( el ) {
		const ov = getComputedStyle( el ).overflowX;

		return ov === "auto" || ov === "scroll" || el === document.body
			? el
			: this._closestScrollingAncestor( el.parentNode );
	}
	_setStatus( st ) {
		this.classList.remove( `gsuiTimeline-${ this._status }` );
		this.classList.toggle( `gsuiTimeline-${ st }`, !!st );
		this._status = st;
	}
	_getBeatByPageX( pageX ) {
		const bcrX = this._elTimeLine.getBoundingClientRect().x;

		return Math.max( 0, this.beatRound( ( pageX - bcrX ) / this.pxPerBeat ) );
	}
	_updateStepsBg() {
		const sPB = this.stepsPerBeat,
			dots = [];

		for ( let i = 1; i < sPB; ++i ) {
			if ( i > 1 ) {
				dots.push( `transparent calc( ${ ( i - 1 ) / sPB }em + 1px )` );
			}
			dots.push(
				`transparent calc( ${ i / sPB }em - 1px )`,
				`currentColor calc( ${ i / sPB }em - 1px )`,
				`currentColor calc( ${ i / sPB }em + 1px )` );
		}
		this._elSteps.style.backgroundImage = `
			repeating-linear-gradient(90deg, transparent 0em,
				${ dots.join( "," ) },
				transparent calc( ${ ( sPB - 1 ) / sPB }em + 1px ), transparent calc( ${ 1 }em )
			)
		`;
	}
	_updateOffset() {
		const offBeats = Math.floor( this._scrollingAncestor.scrollLeft / this.pxPerBeat ),
			off = this._onlyMeasures
				? Math.floor( offBeats / this.beatsPerMeasure ) * this.beatsPerMeasure
				: offBeats,
			diff = off !== this._offset;

		if ( diff ) {
			this._offset = off;
			this.style.setProperty( "--gsuiTimeline-beats-offset", off );
		}
		return diff;
	}
	_updateNumberBeats() {
		const elBeats = this._elBeats,
			px = this.pxPerBeat * ( this._onlyMeasures ? this.beatsPerMeasure : 1 ),
			nb = Math.ceil( this._scrollingAncestor.clientWidth / px ) + 1;

		if ( nb < 0 || nb > 500 ) {
			return console.warn( "gsuiTimeline: anormal number of nodes to create", nb );
		} else if ( elBeats.children.length > nb ) {
			while ( elBeats.children.length > nb ) {
				elBeats.lastChild.remove();
			}
		} else {
			while ( elBeats.children.length < nb ) {
				elBeats.append( GSUI.createElement( "span", { class: "gsuiTimeline-beat" } ) );
			}
		}
	}
	_updateMeasures() {
		Array.prototype.forEach.call( this._elBeats.children, ( el, i ) => {
			el.classList.toggle( "gsuiTimeline-measure",
				this._onlyMeasures || ( this._offset + i ) % this.beatsPerMeasure === 0 );
		} );
	}
	_updateLoop() {
		this.classList.toggle( "gsuiTimeline-looping", this.looping );
		if ( this.looping ) {
			this._elLoop.style.left = `${ this.loopA }em`;
			this._elLoop.style.width = `${ this.loopB - this.loopA }em`;
		}
	}

	// .........................................................................
	_onscroll() {
		if ( this._updateOffset() && !this._onlyMeasures ) {
			this._updateMeasures();
		}
	}
	_onresize() {
		this._updateNumberBeats();
		this._updateMeasures();
	}
	_onmousedown( e ) {
		const loopLine = e.target.classList.contains( "gsuiTimeline-loopLine" );

		if ( loopLine && Date.now() - this._mousedownDate > 500 ) {
			this._mousedownDate = Date.now();
		} else {
			this._setStatus(
				e.target === this._elCursor.parentNode ? "draggingTime" :
				e.target.classList.contains( "gsuiTimeline-loopBody" ) ? "draggingLoopBody" :
				e.target.classList.contains( "gsuiTimeline-loopHandleA" ) ? "draggingLoopHandleA" :
				e.target.classList.contains( "gsuiTimeline-loopHandleB" ) || loopLine ? "draggingLoopHandleB" : "" );
			if ( this._status ) {
				this._mousemoveBeat = null;
				this._mousedownBeat = this._getBeatByPageX( e.pageX );
				if ( loopLine ) {
					this.loopA =
					this.loopB = this._mousedownBeat;
					this._dispatch( "inputLoopStart" );
				} else {
					this._dispatch( "inputCurrentTimeStart" );
				}
				this._mousedownLoop = this.getAttribute( "loop" );
				this._mousedownLoopA = this.loopA;
				this._mousedownLoopB = this.loopB;
				document.addEventListener( "mousemove", this._onmousemove );
				document.addEventListener( "mouseup", this._onmouseup );
				GSUI.unselectText();
				this._onmousemove( e );
			}
		}
	}
	_onmousemove( e ) {
		const beat = this._getBeatByPageX( e.pageX ),
			beatRel = beat - this._mousedownBeat;

		if ( beatRel !== this._mousemoveBeat ) {
			this._mousemoveBeat = beatRel;
			switch ( this._status ) {
				case "draggingTime":
					this.setAttribute( "currenttime-preview", beat );
					this._dispatch( "inputCurrentTime", beat );
					break;
				case "draggingLoopBody": {
					const rel = Math.max( -this._mousedownLoopA, beatRel ),
						a = this._mousedownLoopA + rel,
						b = this._mousedownLoopB + rel,
						loop = `${ a }-${ b }`;

					if ( loop !== this.getAttribute( "loop" ) ) {
						this.setAttribute( "loop", loop );
						this._dispatch( "inputLoop", a, b );
					}
				} break;
				case "draggingLoopHandleA":
				case "draggingLoopHandleB": {
					const handA = this._status === "draggingLoopHandleA",
						rel = handA
							? Math.max( -this._mousedownLoopA, beatRel )
							: beatRel,
						a = this._mousedownLoopA + ( handA ? rel : 0 ),
						b = this._mousedownLoopB + ( handA ? 0 : rel ),
						aa = Math.min( a, b ),
						bb = Math.max( a, b ),
						loop = `${ aa }-${ bb }`;

					if ( a > b ) {
						if ( handA ) {
							this._setStatus( "draggingLoopHandleB" );
							this._mousedownLoopA = this._mousedownLoopB;
						} else {
							this._setStatus( "draggingLoopHandleA" );
							this._mousedownLoopB = this._mousedownLoopA;
						}
						this._mousedownBeat = this._mousedownLoopA;
					}
					if ( loop !== this.getAttribute( "loop" ) ) {
						if ( aa !== bb ) {
							this.setAttribute( "loop", loop );
							this._dispatch( "inputLoop", aa, bb );
						} else if ( this.hasAttribute( "loop" ) ) {
							this.removeAttribute( "loop" );
							this._dispatch( "inputLoop", false );
						}
					}
				} break;
			}
		}
	}
	_onmouseup() {
		document.removeEventListener( "mousemove", this._onmousemove );
		document.removeEventListener( "mouseup", this._onmouseup );
		switch ( this._status ) {
			case "draggingTime": {
				const beat = this.getAttribute( "currenttime-preview" );

				this.removeAttribute( "currenttime-preview" );
				this._dispatch( "inputCurrentTimeEnd" );
				if ( beat !== this.getAttribute( "currenttime" ) ) {
					this.setAttribute( "currenttime", beat );
					this._dispatch( "changeCurrentTime", +beat );
				}
			} break;
			case "draggingLoopBody":
			case "draggingLoopHandleA":
			case "draggingLoopHandleB":
				this._dispatch( "inputLoopEnd" );
				if ( this.getAttribute( "loop" ) !== this._mousedownLoop ) {
					if ( this.loopA !== this.loopB ) {
						this._dispatch( "changeLoop", this.loopA, this.loopB );
					} else {
						this.removeAttribute( "loop" );
						this._dispatch( "changeLoop", false );
					}
				}
				break;
		}
		this._setStatus( "" );
	}
}

customElements.define( "gsui-timeline", gsuiTimeline );
