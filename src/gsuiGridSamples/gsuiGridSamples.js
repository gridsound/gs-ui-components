"use strict";

function gsuiGridSamples() {
	var root = this._clone();

	this.rootElement = root;
	this._elPanel = root.querySelector( ".gsui-panel" );
	this._elGrid = root.querySelector( ".gsui-grid" );
	this._elPanelExt = this._elPanel.querySelector( ".gsui-extend" );
	this._elPanelCnt = this._elPanel.querySelector( ".gsui-content" );
	this._elGridCnt = this._elGrid.querySelector( ".gsui-content" );
	this._elSelection = this._elGrid.querySelector( ".gsui-select" );
	this.uiTimeLine = new gsuiTimeLine();
	this.uiBeatLines = new gsuiBeatLines();
	root.prepend( this.uiTimeLine.rootElement );
	this._elGrid.prepend( this.uiBeatLines.rootElement );

	root.oncontextmenu = function() { return false; };
	this._elPanelExt.onmousedown = this._evmdPanelEx.bind( this );
	this._elGrid.onmousedown = this._evmdGrid.bind( this );
	this._elGrid.onwheel = this._evowGrid.bind( this );
	this._elPanel.onwheel = this._evowPanel.bind( this );
	this.uiTimeLine.onchangeCurrentTime = this._evocCurrentTime.bind( this );
	this.uiTimeLine.oninputLoop = this._evoiLoop.bind( this );
	this._panelMaxWidth = Infinity;
	this._contentY =
	this._panelMinWidth =
	this._timeOffset = 0;
	this._pxPerBeat = 80;
	this.panelWidth( 100 );
}

gsuiGridSamples.prototype = {
	empty() {
		if ( this.uiTrackList ) {
			this.uiTrackList.empty();
		}
	},
	change( obj ) {
		if ( obj.tracks ) {
			this.uiTrackList.change( obj.tracks );
			this.uiTrackList.newRowElements.forEach( this._rowInit, this );
		}
	},
	resized() {
		var panelStyle = getComputedStyle( this._elPanel );

		this.width = this.rootElement.clientWidth;
		this._panelMinWidth = parseFloat( panelStyle.minWidth );
		this._panelMaxWidth = parseFloat( panelStyle.maxWidth ) || this.width;
		this._resizeGrid();
		this._updateGrid();
	},
	setFontSize( emPx ) {
		var curr = this._fontSize;

		emPx = ~~Math.min( Math.max( 16, emPx ), 256 );
		if ( emPx !== curr ) {
			if ( emPx < 32 !== curr < 32 ) {
				this._elGridCnt.querySelectorAll( ".gsui-row" )
					.forEach( this._rowUpdateSizeClass, this );
			}
			this._fontSize = emPx;
			this.rootElement.style.fontSize = emPx + "px";
		}
	},
	offset( offset, beatPx ) {
		this._timeOffset = offset;
		this._pxPerBeat = beatPx || this._pxPerBeat;
		this._updateGrid( !!beatPx );
	},
	timeSignature( a, b ) {
		this.uiTimeLine.timeSignature( a, b );
		this.uiBeatLines.timeSignature( a, b );
	},
	currentTime( beat ) {
		this.uiTimeLine.currentTime( beat );
		this.uiBeatLines.currentTime( beat );
	},
	loop( a, b ) {
		this.uiTimeLine.loop( a, b );
		this.uiBeatLines.loop( a, b );
	},
	panelWidth( width ) {
		width = Math.max( this._panelMinWidth, Math.min( width, this._panelMaxWidth ) );
		if ( this._timeOffset > 0 ) {
			this._timeOffset += ( width - this._panelWidth ) / this._pxPerBeat;
		}
		this._panelWidth = width;
		this._updatePanelSize();
	},
	contentY( yEm ) {
		var h = ( this.uiTrackList || this.uiKeys ).rootElement.clientHeight;

		h = Math.max( 0, h - this._elGrid.clientHeight ) / this._fontSize;
		this._contentY = yEm = Math.min( Math.max( 0, yEm ), h );
		this._elGridCnt.style.marginTop =
		this._elPanelCnt.style.marginTop = -yEm + "em";
	},
	loadKeys( from, nbOctaves ) {
		this._loadPanelCmp( "uiKeys", "uiTrackList" );
		this.uiKeys.octaves( from, nbOctaves );
		this.uiKeys.newRowElements.forEach( this._rowInit, this );
	},
	loadTrackList() {
		this._loadPanelCmp( "uiTrackList", "uiKeys" );
		this.uiTrackList.onchange = obj => this.onchange( {
			redo: { tracks: obj.redo },
			undo: { tracks: obj.undo }
		} );
	},

	// private:
	_clone() {
		var div = document.createElement( "div" );

		gsuiGridSamples.template = gsuiGridSamples.template || this._init();
		div.appendChild( document.importNode( gsuiGridSamples.template.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},
	_init() {
		document.body.addEventListener( "mousemove", function( e ) {
			gsuiGridSamples._focused && gsuiGridSamples._focused._evmmRoot( e );
		} );
		document.body.addEventListener( "mouseup", function( e ) {
			gsuiGridSamples._focused && gsuiGridSamples._focused._evmuRoot( e );
		} );
		return document.getElementById( "gsuiGridSamples" );
	},
	_loadPanelCmp( cmpStr, oldCmpStr ) {
		var cmp = this[ cmpStr ],
			oldCmp = this[ oldCmpStr ];

		if ( oldCmp ) {
			oldCmp.remove();
			this.setFontSize( this._fontSize * ( cmpStr === "uiKeys" ? .5 : 2 ) );
			delete this[ oldCmpStr ];
		} else {
			this.setFontSize( cmpStr === "uiKeys" ? 20 : 40 );
		}
		if ( !cmp ) {
			this[ cmpStr ] = cmp = cmpStr === "uiKeys" ? new gsuiKeys() : new gsuiTrackList();
			this._elPanelCnt.prepend( cmp.rootElement );
		}
	},
	_resizeGrid() {
		this.uiTimeLine.resized();
		this.uiBeatLines.resized();
	},
	_contentScroll( e ) {
		this.contentY( this._contentY + ( 20 * ( e.deltaY > 0 ? 1 : -1 ) ) / this._fontSize );
	},
	_getMouseBeat( e ) {
		this._elGridCntBCR = this._elGridCnt.getBoundingClientRect();
		return this.uiTimeLine._round( ( e.pageX - this._elGridCntBCR.left ) / this._pxPerBeat );
	},
	_drawSelection( e ) {
		var sty = this._elSelection.style,
			left = this._mdBeat,
			width = this._getMouseBeat( e ) - left,
			top = Math.min( this._mdTrackBCR.top, this._mmTrackBCR.top ),
			bottom = Math.max( this._mdTrackBCR.bottom, this._mmTrackBCR.bottom );

		if ( width < 0 ) {
			width = -width;
			left -= width;
		}
		sty.left = left * this._pxPerBeat + "px";
		sty.width = width * this._pxPerBeat + "px";
		sty.top = top - this._elGridCntBCR.top + "px";
		sty.height = bottom - top + "px";
	},
	_updateGrid( beatPxChanged ) {
		var beatPx = this._pxPerBeat;

		this.uiTimeLine.offset( this._timeOffset, beatPx );
		this.uiBeatLines.offset( this._timeOffset, beatPx );
		this._timeOffset = this.uiTimeLine._offset;
		this._pxPerBeat = beatPx = this.uiTimeLine._pxPerBeat;
		this._elGridCnt.style.left = -this._timeOffset * beatPx + "px";
		if ( beatPxChanged ) {
			this._elGridCnt.querySelectorAll( ".gsui-row" )
				.forEach( this._rowUpdateFontSize, this );
		}
	},
	_updatePanelSize() {
		this._elPanel.style.width =
		this._elGrid.style.left = this._panelWidth + "px";
		this.uiTimeLine.rootElement.style.left = this._panelWidth - 1 + "px";
		this._resizeGrid();
		this._updateGrid();
	},
	_findTrack( e ) {
		var rows = this._elGridCnt.querySelectorAll( ".gsui-row" ),
			ind = ~~( ( e.pageY - this._elGridCntBCR.top ) / this._fontSize );

		return rows[ Math.max( 0, Math.min( ind, rows.length - 1 ) ) ];
	},
	_createBlock( obj, elRow ) {
		var uiBlock = new gsuiAudioBlock();

		uiBlock.when( obj.when );
		uiBlock.duration( obj.duration );
		if ( obj.key ) {
			uiBlock.datatype( "key" );
			uiBlock.name( obj.key );
		}
		elRow.firstChild.append( uiBlock.rootElement );
	},

	// row methods:
	_rowInit( elRow, i ) {
		var keys = this.uiKeys;

		if ( keys ) {
			elRow.onmousedown = this._evmdRow.bind( this, elRow,
				keys._octStart + keys._nbOct - 1 - ~~( i / 12 ) );
		}
		this._rowUpdateFontSize( elRow );
		this._rowUpdateSizeClass( elRow );
		this._elGridCnt.append( elRow );
	},
	_rowUpdateFontSize( elRow ) {
		elRow.firstChild.style.fontSize = this._pxPerBeat + "px";
	},
	_rowUpdateSizeClass( elRow ) {
		elRow.classList.toggle( "gs-row-tiny", this._fontSize < 32 );
	},
	
	// events:
	_evocCurrentTime( beat ) {
		this.uiBeatLines.currentTime( beat );
		this.onchangeCurrentTime && this.onchangeCurrentTime( beat );
	},
	_evoiLoop( toggle, a, b ) {
		this.uiBeatLines.loop( toggle && a, b );
		this.oninputLoop && this.oninputLoop( toggle, a, b );
	},
	_evmdGrid( e ) {
		this._mdPageX = e.pageX;
		this._mdPageY = e.pageY;
		this._mdBeat = this._getMouseBeat( e );
		gsuiGridSamples._focused = this;
		if ( e.shiftKey ) {
			this._selectionStarting = true;
		} else if ( e.altKey ) {
			this._gridDragging = true;
			this._mouseOffset = this._timeOffset;
			this._mouseContentY = this._contentY;
		}
	},
	_evmdPanelEx( e ) {
		this._rootLeft = this.rootElement.getBoundingClientRect().left;
		this._panelResizing = this._elPanelExt.clientWidth - e.layerX;
		this._elPanelExt.classList.add( "gsui-hover" );
		gsuiGridSamples._focused = this;
	},
	_evmdRow( elRow, octave, e ) {
		if ( !e.shiftKey && !e.ctrlKey && !e.altKey ) {
			if ( e.button === 0 ) {
				this._createBlock( {
					when: this._getMouseBeat( e ),
					offset: 0,
					duration: 1,
					key: elRow.dataset.key + octave
				}, elRow );
			} else if ( e.button === 2 ) {
				// ...
			}
		}
	},
	_evowGrid( e ) {
		if ( !e.shiftKey && !e.ctrlKey ) {
			this._contentScroll( e );
		} else {
			var layerX, offInc, beatPx = this._pxPerBeat;

			if ( e.ctrlKey ) {
				layerX = e.pageX - this._elGrid.getBoundingClientRect().left;
				beatPx = Math.min( Math.max( 8, beatPx * ( e.deltaY > 0 ? .9 : 1.1 ) ), 512 );
				offInc = ( layerX / this._pxPerBeat * ( beatPx - this._pxPerBeat ) ) / beatPx;
			} else {
				offInc = ( e.deltaY > 0 ? 20 : -20 ) / beatPx;
			}
			this.offset( Math.max( 0, this._timeOffset + offInc ),
				e.ctrlKey ? beatPx : undefined );
		}
		return false;
	},
	_evowPanel( e ) {
		if ( e.ctrlKey ) {
			var layerY = e.pageY - this._elPanel.getBoundingClientRect().top,
				oldFs = this._fontSize,
				fs = oldFs * ( e.deltaY > 0 ? .9 : 1.1 );

			this.setFontSize( fs );
			fs = this._fontSize;
			this.contentY( this._contentY + ( layerY / oldFs * ( fs - oldFs ) ) / fs );
		} else if ( !e.shiftKey ) {
			this._contentScroll( e );
		}
		return false;
	},
	_evmmRoot( e ) {
		var pxRel = e.pageX - this._mdPageX,
			pyRel = e.pageY - this._mdPageY;

		if ( this._gridDragging ) {
			this.offset( this._mouseOffset - pxRel / this._pxPerBeat, this._pxPerBeat );
			this.contentY( this._mouseContentY - pyRel / this._fontSize );
		} else if ( this._panelResizing != null ) {
			this.panelWidth( e.pageX - this._rootLeft + this._panelResizing );
		} else if ( this._selectionStarted ) {
			this._mmTrackBCR = this._findTrack( e ).getBoundingClientRect();
			this._drawSelection( e );
		} else if ( this._selectionStarting ) {
			if ( Math.max( Math.abs( pxRel ), Math.abs( pyRel ) ) > 6 ) {
				this._mdTrackBCR =
				this._mmTrackBCR = this._findTrack( e ).getBoundingClientRect();
				this._drawSelection( e );
				this._elSelection.classList.remove( "hidden" );
				this._selectionStarted = true;
				delete this._selectionStarting;
			}
		}
	},
	_evmuRoot( e ) {
		this._elPanelExt.classList.remove( "gsui-hover" );
		this._elSelection.classList.add( "hidden" );
		delete this._gridDragging;
		delete this._selectionStarted;
		delete this._selectionStarting;
		delete this._panelResizing;
		delete gsuiGridSamples._focused;
	}
};
