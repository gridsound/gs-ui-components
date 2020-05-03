"use strict";

class gsuiDrums {
	constructor() {
		const root = gsuiDrums.template.cloneNode( true ),
			elLines = root.querySelector( ".gsuiDrums-lines" ),
			timeline = new gsuiTimeline(),
			drumrows = new gsuiDrumrows(),
			beatlines = new gsuiBeatlines( elLines ),
			panels = new gsuiPanels( root.querySelector( ".gsuiDrums-panels" ) ),
			elRows = drumrows.rootElement;

		this.rootElement = root;
		this.drumrows = drumrows;
		this.oninput =
		this.onchange =
		this.onchangeLoop =
		this.onchangeCurrentTime = () => {};

		this._panels = panels;
		this._timeline = timeline;
		this._beatlines = beatlines;
		this._elRows = elRows;
		this._elLines = elLines;
		this._timeoutIdBeatlines = null;
		this._width =
		this._height =
		this._offset =
		this._scrollTop =
		this._scrollLeft =
		this._drumHoverX =
		this._drumHoverBeat =
		this._linesPanelWidth = 0;
		this._stepsPerBeat = 4;
		this._pxPerBeat = 80;
		this._pxPerStep = this._pxPerBeat / this._stepsPerBeat;
		this._dragging = false;
		this._draggingRowId = null;
		this._draggingWhenStart = 0;
		this._attached =
		this._drumHovering = false;
		this._drumsMap = new Map();
		this._previewDrums = new Map();
		this._elLoopA = this._qS( "loopA" );
		this._elLoopB = this._qS( "loopB" );
		this._elLinesAbs = this._qS( "linesAbsolute" );
		this._elDrumHover = this._qS( "drumHover" );
		this._elCurrentTime = this._qS( "currentTime" );
		this._nlLinesIn = root.getElementsByClassName( "gsuiDrums-lineIn" );
		this._onmouseupNewDrum = this._onmouseupNewDrum.bind( this );
		Object.seal( this );

		root.oncontextmenu = e => e.preventDefault();
		this._elDrumHover.remove();
		this._elDrumHover.onmousedown = this._onmousedownNewDrum.bind( this );
		drumrows.setLinesParent( this._elLinesAbs, "gsuiDrums-line" );
		elRows.onscroll = this._onscrollRows.bind( this );
		elLines.onscroll = this._onscrollLines.bind( this );
		elLines.onwheel = this._onwheelLines.bind( this );
		elLines.onmousemove = this._mousemoveLines.bind( this );
		timeline.oninputLoop = this._oninputLoop.bind( this );
		timeline.onchangeLoop = ( isLoop, a, b ) => this.onchangeLoop( isLoop, a, b );
		timeline.onchangeCurrentTime = t => {
			this._setCurrentTime( t );
			this.onchangeCurrentTime( t );
		};
		this._qS( "sidePanel" ).append( drumrows.rootElement );
		this._qS( "timelineWrap" ).append( timeline.rootElement );
		this._qS( "linesPanel" ).onresizing = this._linesPanelResizing.bind( this );
		this._elLinesAbs.onmouseleave = this._onmouseleaveLines.bind( this );
	}

	// .........................................................................
	attached() {
		this._attached = true;
		this._panels.attached();
		this._timeline.resized();
		this._timeline.offset( this._offset, this._pxPerBeat );
	}
	resize( w, h ) {
		this._width = w;
		this._height = h;
		this._timeline.resized();
		this._timeline.offset( this._offset, this._pxPerBeat );
	}
	toggleShadow( b ) {
		this.rootElement.classList.toggle( "gsuiDrums-shadowed", b );
	}
	currentTime( beat ) {
		this._timeline.currentTime( beat );
		this._setCurrentTime( beat );
	}
	loop( a, b ) {
		this._timeline.loop( a, b );
		this._setLoop( Number.isFinite( a ), a, b );
	}
	timeSignature( a, b ) {
		this._stepsPerBeat = b;
		this._timeline.timeSignature( a, b );
		this._beatlines.timeSignature( a, b );
		this.setPxPerBeat( this._pxPerBeat );
		this._elDrumHover.style.width =
		this._elCurrentTime.style.width = `${ 1 / b }em`;
	}
	setPxPerBeat( ppb ) {
		const ppbpx = `${ ppb }px`;

		this._pxPerBeat = ppb;
		this._pxPerStep = ppb / this._stepsPerBeat;
		this._timeline.offset( this._offset, ppb );
		this._beatlines.pxPerBeat( ppb );
		this._elLoopA.style.fontSize =
		this._elLoopB.style.fontSize =
		this._elCurrentTime.style.fontSize = ppbpx;
		Array.prototype.forEach.call( this._nlLinesIn, el => el.style.fontSize = ppbpx );
		clearTimeout( this._timeoutIdBeatlines );
		this._timeoutIdBeatlines = setTimeout( () => this._beatlines.render(), 100 );
	}

	// .........................................................................
	addDrum( id, drum ) {
		const elDrm = gsuiDrums.templateDrum.cloneNode( true ),
			stepDur = 1 / this._stepsPerBeat;

		elDrm.dataset.id = id;
		elDrm.style.left = `${ drum.when }em`;
		elDrm.style.width = `${ stepDur }em`;
		this._qS( `line[data-id='${ drum.row }'] .gsuiDrums-lineIn` ).append( elDrm );
		this._drumsMap.set( id, [ drum.row, Math.round( drum.when / stepDur ), elDrm ] );
	}
	removeDrum( id ) {
		const elDrm = this._drumsMap.get( id )[ 2 ];

		elDrm.remove();
		this._drumsMap.delete( id );
	}
	createDrumrow() {
		const elLine = gsuiDrums.templateLine.cloneNode( true );

		elLine.firstElementChild.style.fontSize = `${ this._pxPerBeat }px`;
		return elLine;
	}

	// .........................................................................
	_qS( c ) {
		return this.rootElement.querySelector( `.gsuiDrums-${ c }` );
	}
	_has( el, c ) {
		return el.classList.contains( `gsuiDrums-${ c }` );
	}
	_setCurrentTime( t ) {
		const sPB = 1 / this._stepsPerBeat,
			tr = ( t / sPB | 0 ) * sPB;

		this._elCurrentTime.style.left = `${ tr }em`;
	}
	_setLoop( isLoop, a, b ) {
		this._elLoopA.classList.toggle( "gsuiDrums-loopOn", isLoop );
		this._elLoopB.classList.toggle( "gsuiDrums-loopOn", isLoop );
		if ( isLoop ) {
			this._elLoopA.style.width = `${ a }em`;
			this._elLoopB.style.left = `${ b }em`;
		}
	}
	_hideDrumHover() {
		this._drumHovering = false;
		this._elDrumHover.remove();
	}
	_createPreviewDrum( rowId, when ) {
		const el = gsuiDrums.templateDrum.cloneNode( true );

		el.classList.add( "gsuiDrums-drumPreview" );
		el.style.left = `${ when }em`;
		el.style.width = `${ 1 / this._stepsPerBeat }em`;
		this._qS( `line[data-id='${ rowId }'] .gsuiDrums-lineIn` ).append( el );
		return el;
	}
	_createPreviewDrums( whenFrom, whenTo ) {
		const rowId = this._draggingRowId,
			adding = this._dragging === 1,
			stepDur = 1 / this._stepsPerBeat,
			whenA = Math.round( Math.min( whenFrom, whenTo ) / stepDur ),
			whenB = Math.round( Math.max( whenFrom, whenTo ) / stepDur ),
			added = new Map();

		for ( let w = whenA; w <= whenB; ++w ) {
			added.set( w );
			if ( !this._previewDrums.has( w ) ) {
				if ( adding ) {
					this._previewDrums.set( w, this._createPreviewDrum( rowId, w * stepDur ) );
				} else {
					let drm;

					this._drumsMap.forEach( arr => {
						if ( arr[ 0 ] === rowId && arr[ 1 ] === w ) {
							drm = arr[ 2 ];
							drm.classList.add( "gsuiDrums-previewDeleted" );
						}
					} );
					this._previewDrums.set( w, drm );
				}
			}
		}
		this._previewDrums.forEach( ( el, w ) => {
			if ( !added.has( w ) ) {
				if ( adding ) {
					el.remove();
				} else if ( el ) {
					el.classList.remove( "gsuiDrums-previewDeleted" );
				}
				this._previewDrums.delete( w );
			}
		} );
	}
	_removePreviewDrums( adding ) {
		this._previewDrums.forEach( el => {
			if ( adding ) {
				el.remove();
			} else if ( el ) {
				el.classList.remove( "gsuiDrums-previewDeleted" );
			}
		} );
		this._previewDrums.clear();
	}

	// events:
	// .........................................................................
	_oninputLoop( isLoop, a, b ) {
		this._setLoop( isLoop, a, b );
	}
	_linesPanelResizing( pan ) {
		const width = pan.clientWidth;

		if ( this._offset > 0 ) {
			this._offset -= ( width - this._linesPanelWidth ) / this._pxPerBeat;
			this._elLines.scrollLeft -= width - this._linesPanelWidth;
		}
		this._linesPanelWidth = width;
		this._timeline.resized();
		this._timeline.offset( this._offset, this._pxPerBeat );
	}
	_onscrollRows() {
		const scrollTop = this._elRows.scrollTop;

		if ( scrollTop !== this._scrollTop ) {
			this._scrollTop =
			this._elLines.scrollTop = scrollTop;
		}
	}
	_onscrollLines() {
		const scrollTop = this._elLines.scrollTop,
			scrollLeft = this._elLines.scrollLeft;

		if ( scrollTop !== this._scrollTop ) {
			this._scrollTop =
			this._elRows.scrollTop = scrollTop;
		}
		if ( scrollLeft !== this._scrollLeft ) {
			this._scrollLeft = scrollLeft;
			this._offset = scrollLeft / this._pxPerBeat;
			this._timeline.offset( this._offset, this._pxPerBeat );
		}
		this.__mousemoveLines();
	}
	_onwheelLines( e ) {
		if ( e.ctrlKey ) {
			const elLines = this._elLines,
				layerX = e.pageX - elLines.getBoundingClientRect().left + elLines.scrollLeft,
				ppb = Math.round( Math.min( Math.max( 48, this._pxPerBeat * ( e.deltaY > 0 ? .9 : 1.1 ) ), 128 ) );

			this._scrollLeft =
			elLines.scrollLeft += layerX / this._pxPerBeat * ( ppb - this._pxPerBeat );
			this._offset = elLines.scrollLeft / ppb;
			this.setPxPerBeat( ppb );
			this.__mousemoveLines();
		}
	}
	_mousemoveLines( e ) {
		const tar = e.target,
			elLine = this._has( tar, "lineIn" ) ? tar :
				this._has( tar, "drum" ) ? tar.parentNode : null;

		if ( elLine ) {
			this._drumHovering = true;
			this._drumHoverX = e.pageX;
			this.__mousemoveLines();
			if ( !this._dragging && this._elDrumHover.parentNode !== elLine ) {
				elLine.append( this._elDrumHover );
			}
		}
	}
	__mousemoveLines() {
		if ( this._drumHovering ) {
			const el = this._elDrumHover,
				bcr = this._elLinesAbs.getBoundingClientRect(),
				pageX = this._drumHoverX,
				beat = ( ( pageX - bcr.left ) / this._pxPerStep | 0 ) / this._stepsPerBeat;

			this._drumHoverBeat = beat;
			el.style.left = `${ beat * this._pxPerBeat }px`;
			if ( this._dragging ) {
				this._createPreviewDrums( this._draggingWhenStart, beat );
			}
		}
	}
	_onmouseleaveLines() {
		if ( !this._dragging ) {
			this._hideDrumHover();
		}
	}
	_onmousedownNewDrum( e ) {
		if ( !this._dragging ) {
			const when = this._drumHoverBeat;

			this._dragging = e.button === 0 ? 1 : 2;
			this._draggingRowId = this._elDrumHover.parentNode.parentNode.dataset.id;
			this._draggingWhenStart = when;
			this._createPreviewDrums( when, when );
			window.getSelection().removeAllRanges();
			document.addEventListener( "mouseup", this._onmouseupNewDrum );
		}
	}
	_onmouseupNewDrum() {
		const adding = this._dragging === 1,
			act = adding ? "addDrums" : "removeDrums";

		this._dragging = false;
		this._removePreviewDrums( adding );
		document.removeEventListener( "mouseup", this._onmouseupNewDrum );
		this.onchange( act, this._draggingRowId, this._draggingWhenStart, this._drumHoverBeat );
	}
}

gsuiDrums.template = document.querySelector( "#gsuiDrums-template" );
gsuiDrums.template.remove();
gsuiDrums.template.removeAttribute( "id" );

gsuiDrums.templateLine = document.querySelector( "#gsuiDrums-line-template" );
gsuiDrums.templateLine.remove();
gsuiDrums.templateLine.removeAttribute( "id" );

gsuiDrums.templateDrum = document.querySelector( "#gsuiDrums-drum-template" );
gsuiDrums.templateDrum.remove();
gsuiDrums.templateDrum.removeAttribute( "id" );
