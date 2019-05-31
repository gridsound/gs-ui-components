"use strict";

class gsuiTimeline {
	constructor() {
		const root = gsuiTimeline.template.cloneNode( true ),
			qs = c => root.querySelector( `.gsuiTimeline-${ c }` );

		this.rootElement = root;
		this.stepRound = 1;
		this._evMouseup =
		this._evMousemove =
		this.oninputLoop =
		this.onchangeLoop =
		this.onchangeCurrentTime = null;
		this.width =
		this.height =
		this._loopA =
		this._loopB =
		this._offset =
		this._loopAWas =
		this._loopBWas =
		this._loopClick =
		this._currentTime =
		this._previewCurrentTime = 0;
		this._pxPerBeat = 32;
		this._beatsPerMeasure =
		this._stepsPerBeat = 4;
		this._steps = [];
		this._loop =
		this._loopWas =
		this._timeisdrag =
		this._loopisdrag =
		this._loopisdragA =
		this._loopisdragB = false;
		this._loopSerial =
		this._loopSerialInp = "";
		this._elLoop = qs( "loop" );
		this._elLoopA = qs( "loopA" );
		this._elLoopB = qs( "loopB" );
		this._elCursor = qs( "cursor" );
		this._elLoopBg = qs( "loopBg" );
		this._elLoopBrdA = qs( "loopBrdA" );
		this._elLoopBrdB = qs( "loopBrdB" );
		this._elLoopLine = qs( "loopLine" );
		this._elCurrentTime = qs( "currentTime" );
		this._elCursorPreview = qs( "cursorPreview" );
		Object.seal( this );

		this._elLoopA.onmousedown = this._mousedownLoop.bind( this, "a" );
		this._elLoopB.onmousedown = this._mousedownLoop.bind( this, "b" );
		this._elLoopBg.onmousedown = this._mousedownLoop.bind( this, "ab" );
		this._elLoopLine.onmousedown = this._mousedownLoopLine.bind( this );
		this._elCurrentTime.onmousedown = this._mousedownTime.bind( this );
		this.currentTime( 0 );
		this.loop( 0, 0 );
	}

	resized() {
		const rc = this.rootElement.getBoundingClientRect();

		this.width = rc.width;
		this.height = rc.height;
	}
	currentTime( beat, isUserAction ) {
		this._currentTime = beat;
		this._elCursor.style.left = this._beatToPx( beat );
		if ( isUserAction && this.onchangeCurrentTime ) {
			this.onchangeCurrentTime( beat );
		}
	}
	offset( beat, pxBeat ) {
		this._offset = Math.max( 0, +beat || 0 );
		this._pxPerBeat = +pxBeat;
		this._render();
	}
	timeSignature( a, b ) {
		this._beatsPerMeasure = Math.max( 1, ~~a );
		this._stepsPerBeat = Math.min( Math.max( 1, ~~b ), 16 );
		this._render();
	}
	beatRound( bt ) { return this._round( bt, "round" ); }
	beatFloor( bt ) { return this._round( bt, "floor" ); }
	beatCeil( bt ) { return this._round( bt, "ceil" ); }
	loop( a, b, isUserAction ) {
		const loopWas = this._loop;
		let la, lb;

		if ( a === false ) {
			this._loop = a;
		} else {
			this._loopA = Math.max( 0, Math.min( a, b ) );
			this._loopB = Math.max( 0, a, b );
		}
		if ( isUserAction ) {
			la = this.beatRound( this._loopA );
			lb = this.beatRound( this._loopB );
		} else {
			la = this._loopA;
			lb = this._loopB;
		}
		if ( a !== false ) {
			this._loop = lb - la > 1 / this._stepsPerBeat / 8;
		}
		if ( isUserAction ) {
			if ( this.oninputLoop ) {
				const serial = loopWas && this._loop
						? this._serialAB( la, lb )
						: undefined;

				if ( loopWas !== this._loop || this._loopSerialInp !== serial ) {
					this._loopSerialInp = serial;
					this.oninputLoop( this._loop, la, lb );
				}
			}
		} else {
			this._loopWas = this._loop;
			this._loopAWas = la;
			this._loopBWas = lb;
			this._loopSerial = this._serialAB( la, lb );
		}
		this._setLoop( la, lb );
	}
	previewCurrentTime( beat ) {
		const el = this._elCursorPreview,
			hide = beat === false;

		if ( !hide ) {
			this._previewCurrentTime = this.beatRound( beat );
			el.style.left = this._beatToPx( this._previewCurrentTime );
		}
		el.classList.toggle( "gsui-hidden", hide );
		return this._previewCurrentTime;
	}

	// private:
	_round( bt, mathFn ) {
		if ( this.stepRound ) {
			const mod = 1 / this._stepsPerBeat * this.stepRound;

			return Math[ mathFn ]( bt / mod ) * mod;
		}
		return bt;
	}
	_layerX( e ) {
		return e.pageX - this.rootElement.getBoundingClientRect().left;
	}
	_pageXtoBeat( e ) {
		return Math.max( 0, this.beatRound( this._offset + this._layerX( e ) / this._pxPerBeat ) );
	}
	_beatToPx( beat ) {
		return `${ ( beat - this._offset ) * this._pxPerBeat }px`;
	}
	_serialAB( a, b ) {
		return `${ a.toFixed( 4 ) } ${ b.toFixed( 4 ) }`;
	}
	_bindEvents() {
		this._evMouseup = this._mouseup.bind( this );
		this._evMousemove = this._mousemove.bind( this );
		document.addEventListener( "mouseup", this._evMouseup );
		document.addEventListener( "mousemove", this._evMousemove );
	}
	_mousedownTime( e ) {
		this._timeisdrag = true;
		this._mousemove( e );
		this._bindEvents();
	}
	_mousedownLoop( side ) {
		this._loopisdrag = true;
		this._loopisdragA = side === "a";
		this._loopisdragB = side === "b";
		this._elLoopBg.classList.toggle( "gsui-hover", side === "ab" );
		this._elLoopBrdA.classList.toggle( "gsui-hover", this._loopisdragA );
		this._elLoopBrdB.classList.toggle( "gsui-hover", this._loopisdragB );
		this._bindEvents();
	}
	_mousedownLoopLine( e ) {
		const now = Date.now(),
			bt = this._offset + this._layerX( e ) / this._pxPerBeat;

		if ( !this._loopClick || now - this._loopClick > 500 ) {
			this._loopClick = now;
		} else {
			this.loop( false, 0, true );
			this.loop( bt, bt, true );
			this._mousedownLoop( "b" );
		}
	}
	_mousemove( e ) {
		if ( this._timeisdrag ) {
			this.previewCurrentTime( this._pageXtoBeat( e ) );
		} else if ( this._loopisdrag ) {
			const la = this._loopisdragA,
				lb = this._loopisdragB;
			let bt = e.movementX / this._pxPerBeat,
				a = this._loopA,
				b = this._loopB;

			if ( la || lb ) {
				la
					? a += bt
					: b += bt;
				if ( a > b ) {
					this._loopisdragA = lb;
					this._loopisdragB = la;
					this._elLoopBrdA.classList.toggle( "gsui-hover", lb );
					this._elLoopBrdB.classList.toggle( "gsui-hover", la );
				}
			} else {
				if ( a + bt < 0 ) {
					bt = -a;
				}
				a += bt;
				b += bt;
			}
			this.loop( a, b, true );
		}
	}
	_mouseup( e ) {
		document.removeEventListener( "mouseup", this._evMouseup );
		document.removeEventListener( "mousemove", this._evMousemove );
		if ( this._timeisdrag ) {
			this.previewCurrentTime( false );
			this.currentTime( this._pageXtoBeat( e ), true );
			this._timeisdrag = false;
		} else if ( this._loopisdrag ) {
			const l = this._loop,
				la = this.beatRound( this._loopA ),
				lb = this.beatRound( this._loopB );

			this._loopA = la;
			this._loopB = lb;
			this._loopisdrag =
			this._loopisdragA =
			this._loopisdragB = false;
			this._elLoopBg.classList.remove( "gsui-hover" );
			this._elLoopBrdA.classList.remove( "gsui-hover" );
			this._elLoopBrdB.classList.remove( "gsui-hover" );
			if ( this.onchangeLoop ) {
				if ( !l ) {
					if ( this._loopWas ) {
						this._loopWas = l;
						this.onchangeLoop( l, this._loopAWas, this._loopBWas );
					}
				} else {
					const serial = this._serialAB( la, lb );

					if ( this._loopWas !== this._loop || this._loopSerial !== serial ) {
						this._loopWas = l;
						this._loopAWas = la;
						this._loopBWas = lb;
						this._loopSerial = serial;
						this.onchangeLoop( l, la, lb );
					}
				}
			}
		}
	}
	_setLoop( beatA, beatB ) {
		const s = this._elLoop.style;

		if ( this._loop ) {
			const px = this._pxPerBeat,
				off = this._offset;

			s.left = `${ ( beatA - off ) * px }px`;
			s.right = `${ this.width - ( beatB - off ) * px }px`;
			s.display = "block";
		} else {
			s.display = "none";
		}
	}
	_render() {
		const rootCL = this.rootElement.classList,
			elSteps = this._steps,
			beatPx = this._pxPerBeat,
			stepsBeat = this._stepsPerBeat,
			stepsMeasure = stepsBeat * this._beatsPerMeasure,
			stepPx = beatPx / stepsBeat,
			stepEm = 1 / stepsBeat,
			stepsDuration = Math.ceil( this.width / stepPx + 2 );
		let stepId = 0,
			step = ~~( this._offset * stepsBeat ),
			em = -this._offset % stepEm;

		rootCL.remove( "gsui-step", "gsui-beat", "gsui-measure" );
		rootCL.add( `gsui-${ beatPx > 24 ? beatPx > 72 ?
				"step" : "beat" : "measure" }` );
		while ( elSteps.length < stepsDuration ) {
			elSteps.push( document.createElement( "div" ) );
		}
		for ( ; stepId < stepsDuration; ++stepId ) {
			const stepRel = step % stepsBeat,
				elStep = elSteps[ stepId ];

			elStep.style.left = `${ em * beatPx }px`;
			elStep.className = `gsuiTimeline-${ step % stepsMeasure ? stepRel
				? "step" : "beat" : "measure" }`;
			elStep.textContent = elStep.className !== "gsuiTimeline-step"
				? ~~( 1 + step / stepsBeat ) : "." ;
			if ( !elStep.parentNode ) {
				this.rootElement.append( elStep );
			}
			++step;
			em += stepEm;
		}
		for ( ; stepId < elSteps.length; ++stepId ) {
			const elStep = elSteps[ stepId ];

			if ( !elStep.parentNode ) {
				break;
			}
			elStep.remove();
		}
		this._elCursor.style.left = this._beatToPx( this._currentTime );
		this._setLoop(
			this.beatRound( this._loopA ),
			this.beatRound( this._loopB ) );
	}
}

gsuiTimeline.template = document.querySelector( "#gsuiTimeline-template" );
gsuiTimeline.template.remove();
gsuiTimeline.template.removeAttribute( "id" );
