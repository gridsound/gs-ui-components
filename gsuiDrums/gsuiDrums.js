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
		this._hoverBeat =
		this._hoverPageX =
		this._linesPanelWidth = 0;
		this._stepsPerBeat = 4;
		this._pxPerBeat = 80;
		this._pxPerStep = this._pxPerBeat / this._stepsPerBeat;
		this._currAction = "";
		this._draggingRowId = null;
		this._draggingWhenStart = 0;
		this._attached = false;
		this._hoveringStatus = "";
		this._drumsMap = new Map();
		this._previewsMap = new Map();
		this._elLoopA = this._qS( "loopA" );
		this._elLoopB = this._qS( "loopB" );
		this._elLinesAbs = this._qS( "linesAbsolute" );
		this._elHover = null;
		this._elDrumHover = this._qS( "drumHover" );
		this._elDrumcutHover = this._qS( "drumcutHover" );
		this._elCurrentTime = this._qS( "currentTime" );
		this._nlLinesIn = root.getElementsByClassName( "gsuiDrums-lineIn" );
		this._onmouseupNew = this._onmouseupNew.bind( this );
		this._mousemoveLines = this._mousemoveLines.bind( this );
		this._dispatch = GSUtils.dispatchEvent.bind( null, root, "gsuiDrums" );
		Object.seal( this );

		root.oncontextmenu = e => e.preventDefault();
		this._elDrumHover.remove();
		this._elDrumcutHover.remove();
		this._elDrumHover.onmousedown = this._onmousedownNew.bind( this, "Drums" );
		this._elDrumcutHover.onmousedown = this._onmousedownNew.bind( this, "Drumcuts" );
		drumrows.setLinesParent( this._elLinesAbs, "gsuiDrums-line" );
		elRows.onscroll = this._onscrollRows.bind( this );
		elLines.onscroll = this._onscrollLines.bind( this );
		elLines.onwheel = this._onwheelLines.bind( this );
		elLines.onmousemove = this._mousemoveLines;
		timeline.oninputLoop = this._oninputLoop.bind( this );
		timeline.onchangeLoop = ( isLoop, a, b ) => {
			this._dispatch( "changeLoop", isLoop, a, b );
		};
		timeline.onchangeCurrentTime = t => {
			this._setCurrentTime( t );
			this._dispatch( "changeCurrentTime", t );
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
		this._elDrumcutHover.style.width =
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
	addDrum( id, drum ) { this._addItem( id, drum, "drum" ); }
	addDrumcut( id, drumcut ) { this._addItem( id, drumcut, "drumcut" ); }
	removeDrum( id ) { this._removeItem( id ); }
	removeDrumcut( id ) { this._removeItem( id ); }
	createDrumrow() {
		const elLine = gsuiDrums.templateLine.cloneNode( true );

		elLine.querySelector( ".gsuiDrums-lineIn" ).style.fontSize = `${ this._pxPerBeat }px`;
		return elLine;
	}
	_addItem( id, item, itemType ) {
		const elItem = "gain" in item
				? gsuiDrums.templateDrum.cloneNode( true )
				: gsuiDrums.templateDrumcut.cloneNode( true ),
			stepDur = 1 / this._stepsPerBeat;

		elItem.dataset.id = id;
		elItem.style.left = `${ item.when }em`;
		elItem.style.width = `${ stepDur }em`;
		this._qS( `line[data-id='${ item.row }'] .gsuiDrums-lineIn` ).append( elItem );
		this._drumsMap.set( id, [ item.row, itemType, Math.round( item.when / stepDur ), elItem ] );
	}
	_removeItem( id ) {
		const elItem = this._drumsMap.get( id )[ 3 ];

		elItem.remove();
		this._drumsMap.delete( id );
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
	_createPreview( template, rowId, when ) {
		const el = template.cloneNode( true );

		el.classList.add( "gsuiDrums-preview" );
		el.style.left = `${ when }em`;
		el.style.width = `${ 1 / this._stepsPerBeat }em`;
		this._qS( `line[data-id='${ rowId }'] .gsuiDrums-lineIn` ).append( el );
		return el;
	}
	_createPreviews( whenFrom, whenTo ) {
		const rowId = this._draggingRowId,
			stepDur = 1 / this._stepsPerBeat,
			whenA = Math.round( Math.min( whenFrom, whenTo ) / stepDur ),
			whenB = Math.round( Math.max( whenFrom, whenTo ) / stepDur ),
			added = new Map(),
			map = this._previewsMap,
			adding = this._currAction.startsWith( "add" ),
			itemType = this._currAction.endsWith( "Drums" ) ? "drum" : "drumcut",
			template = itemType === "drum"
				? gsuiDrums.templateDrum
				: gsuiDrums.templateDrumcut,
			drumsArr = [];

		this._drumsMap.forEach( ( arr, id ) => {
			if ( arr[ 0 ] === rowId && arr[ 1 ] === itemType ) {
				drumsArr.push( arr );
			}
		} );
		for ( let w = whenA; w <= whenB; ++w ) {
			added.set( w );
			if ( !map.has( w ) ) {
				if ( adding ) {
					map.set( w, this._createPreview( template, rowId, w * stepDur ) );
				} else {
					drumsArr.find( arr => {
						if ( arr[ 2 ] === w ) {
							arr[ 3 ].classList.add( "gsuiDrums-previewDeleted" );
							map.set( w, arr[ 3 ] );
							return true;
						}
					} );
				}
			}
		}
		map.forEach( ( el, w ) => {
			if ( !added.has( w ) ) {
				adding
					? el.remove()
					: el.classList.remove( "gsuiDrums-previewDeleted" );
				map.delete( w );
			}
		} );
	}
	_removePreviews( adding ) {
		this._previewsMap.forEach( adding
			? el => el.remove()
			: el => el.classList.remove( "gsuiDrums-previewDeleted" ) );
		this._previewsMap.clear();
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
				mul = e.deltaY > 0 ? .9 : 1.1,
				ppb = Math.round( Math.min( Math.max( 48, this._pxPerBeat * mul ), 128 ) );

			this._scrollLeft =
			elLines.scrollLeft += layerX / this._pxPerBeat * ( ppb - this._pxPerBeat );
			this._offset = elLines.scrollLeft / ppb;
			this.setPxPerBeat( ppb );
			this.__mousemoveLines();
		}
	}
	_mousemoveLines( e ) {
		if ( e.target !== this._elHover ) {
			if ( this._currAction ) {
				this._hoverPageX = e.pageX;
				this.__mousemoveLines();
			} else {
				const tar = e.target,
					elLine = this._has( tar, "lineIn" )
						? tar
						: this._has( tar, "drum" ) || this._has( tar, "drumcut" )
							? tar.parentNode
							: null;

				if ( elLine ) {
					const bcr = elLine.getBoundingClientRect(),
						y = ( e.pageY - bcr.top ) / bcr.height,
						elHover =  y > .66 ? this._elDrumcutHover : this._elDrumHover;

					this._hoverPageX = e.pageX;
					this._hoveringStatus = elHover === this._elDrumHover ? "drum" : "drumcut";
					if ( elHover !== this._elHover ) {
						if ( this._elHover ) {
							this._elHover.remove();
						}
						this._elHover = elHover;
					}
					this.__mousemoveLines();
					if ( this._elHover.parentNode !== elLine ) {
						elLine.append( this._elHover );
					}
				} else if ( this._elHover ) {
					this._elHover.remove();
				}
			}
		}
	}
	__mousemoveLines() {
		if ( this._hoveringStatus ) {
			const el = this._elHover,
				left = this._elLinesAbs.getBoundingClientRect().left,
				beat = ( ( this._hoverPageX - left ) / this._pxPerStep | 0 ) / this._stepsPerBeat;

			this._hoverBeat = beat;
			el.style.left = `${ beat * this._pxPerBeat }px`;
			if ( this._currAction ) {
				this._createPreviews( this._draggingWhenStart, beat );
			}
		}
	}
	_onmouseleaveLines() {
		if ( !this._currAction ) {
			this._hoveringStatus = "";
			this._elHover.remove();
		}
	}
	_onmousedownNew( itemType, e ) {
		if ( !this._currAction ) {
			this._currAction = e.button === 0
				? `add${ itemType }`
				: `remove${ itemType }`;
			this._draggingRowId = this._elHover.closest( ".gsuiDrums-line" ).dataset.id;
			this._draggingWhenStart = this._hoverBeat;
			this._createPreviews( this._hoverBeat, this._hoverBeat );
			window.getSelection().removeAllRanges();
			document.addEventListener( "mousemove", this._mousemoveLines );
			document.addEventListener( "mouseup", this._onmouseupNew );
		}
	}
	_onmouseupNew() {
		this._removePreviews( this._currAction.startsWith( "add" ) );
		document.removeEventListener( "mousemove", this._mousemoveLines );
		document.removeEventListener( "mouseup", this._onmouseupNew );
		this._dispatch( "change", this._currAction, this._draggingRowId,
			this._draggingWhenStart, this._hoverBeat );
		this._currAction = "";
		this._elLines.onmousemove = this._mousemoveLines;
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

gsuiDrums.templateDrumcut = document.querySelector( "#gsuiDrums-drumcut-template" );
gsuiDrums.templateDrumcut.remove();
gsuiDrums.templateDrumcut.removeAttribute( "id" );
