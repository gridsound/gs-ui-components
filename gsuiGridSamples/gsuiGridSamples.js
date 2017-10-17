"use strict";

function gsuiGridSamples() {
	var root = this._clone();

	this.rootElement = root;
	this._elPanel = root.querySelector( ".gsuigs-panel" );
	this._elGrid = root.querySelector( ".gsuigs-grid" );
	this._elPanelExt = this._elPanel.querySelector( ".gsuigs-extend" );
	this._elPanelCnt = this._elPanel.querySelector( ".gsuigs-content" );
	this._elGridCnt = this._elGrid.querySelector( ".gsuigs-content" );
	this._elSelection = this._elGrid.querySelector( ".gsuigs-select" );
	this.uiTimeLine = new gsuiTimeLine();
	this.uiBeatLines = new gsuiBeatLines();
	root.prepend( this.uiTimeLine.rootElement );
	this._elGrid.prepend( this.uiBeatLines.rootElement );
	this.rows = this._elGridCnt.childNodes;
	this._rowsById = {};

	root.oncontextmenu = function() { return false; };
	root.onkeydown = this._evkdRoot.bind( this );
	this._elPanelExt.onmousedown = this._evmdPanelEx.bind( this );
	this._elGrid.onmousedown = this._evmdGrid.bind( this );
	this._elGrid.onwheel = this._evowGrid.bind( this );
	this._elPanel.onwheel = this._evowPanel.bind( this );
	this.uiTimeLine.onchangeCurrentTime = this._evocCurrentTime.bind( this );
	this.uiTimeLine.oninputLoop = this._evoiLoop.bind( this );
	this._panelMaxWidth = Infinity;
	this._panelMinWidth =
	this._contentY =
	this._timeOffset = 0;
	this._pxPerBeat = 80;
	this._fontSizeTiny = 48;
	this._bcInit();
	this.panelWidth( 100 );
}

gsuiGridSamples.prototype = {
	empty() {
		if ( this.uiTrackList ) {
			this.uiTrackList.empty();
			this._rowsById = {};
		}
		this._bcEmpty();
	},
	change( obj ) {
		if ( obj.tracks ) {
			this.uiTrackList.change( obj.tracks );
			this.uiTrackList.newRowElements.forEach( this._rowInit, this );
		} else {
			this._bcChange( obj );
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
			this._fontSize = emPx;
			this.rootElement.style.fontSize = emPx + "px";
			if ( emPx < this._fontSizeTiny !== curr < this._fontSizeTiny ) {
				this.rows.forEach( this._rowUpdateSizeClass, this );
			}
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
	scrollToSamples() {
		var smp = this._elGridCnt.querySelector( ".gsuiAudioBlock" );

		if ( smp ) {
			this.contentY( ( smp.getBoundingClientRect().top -
				this._elGridCnt.getBoundingClientRect().top ) / this._fontSize - 3 );
		}
	},
	loadKeys( from, nbOctaves ) {
		this._loadPanelCmp( "uiKeys", "uiTrackList" );
		this._elGridCnt.classList.add( "gsui-noleftcrop" );
		this.uiKeys.octaves( from, nbOctaves );
		this.uiKeys.newRowElements.forEach( this._rowInit, this );
	},
	loadTrackList() {
		this._loadPanelCmp( "uiTrackList", "uiKeys" );
		this._elGridCnt.classList.remove( "gsui-noleftcrop" );
		this.uiTrackList.onchange = obj => this.onchange( { tracks: obj } );
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
	_callOnchange( obj ) {
		for ( var k in obj ) {
			this.onchange( obj );
			break;
		}
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
	_getMouseBeat( pageX ) {
		this._elGridCntBCR = this._elGridCnt.getBoundingClientRect();
		return this.uiTimeLine._round( ( pageX - this._elGridCntBCR.left ) / this._pxPerBeat );
	},
	_updateGrid( beatPxChanged ) {
		var beatPx = this._pxPerBeat;

		this.uiTimeLine.offset( this._timeOffset, beatPx );
		this.uiBeatLines.offset( this._timeOffset, beatPx );
		this._timeOffset = this.uiTimeLine._offset;
		this._pxPerBeat = beatPx = this.uiTimeLine._pxPerBeat;
		this._elGridCnt.style.left = -this._timeOffset * beatPx + "px";
		if ( beatPxChanged ) {
			this.rows.forEach( this._rowUpdateFontSize, this );
		}
	},
	_updatePanelSize() {
		this._elPanel.style.width =
		this._elGrid.style.left = this._panelWidth + "px";
		this.uiTimeLine.rootElement.style.left = this._panelWidth - 1 + "px";
		this._resizeGrid();
		this._updateGrid();
	},
	_findTrack( pageY ) {
		var ind = ~~( ( pageY - this._elGridCntBCR.top ) / this._fontSize );

		return this.rows[ Math.max( 0, Math.min( ind, this.rows.length - 1 ) ) ];
	},

	// private row methods:
	_rowInit( elRow, i ) {
		var keys = this.uiKeys;

		if ( keys ) {
			elRow.dataset.octave = keys._octStart + keys._nbOct - 1 - ~~( i / 12 );
		}
		elRow.onmousedown = this._evmdRow.bind( this, elRow );
		this._rowsById[ elRow.dataset.track ] = elRow;
		this._rowUpdateFontSize( elRow );
		this._rowUpdateSizeClass( elRow );
		this._elGridCnt.append( elRow );
	},
	_rowUpdateFontSize( elRow ) {
		elRow.firstChild.style.fontSize = this._pxPerBeat + "px";
	},
	_rowUpdateSizeClass( elRow ) {
		elRow.classList.toggle( "gs-row-tiny", this._fontSize < this._fontSizeTiny );
	},
	_rowByValue( val ) {
		var uiKeys = this.uiKeys;

		return uiKeys
			? this.rows[ uiKeys.rowElements.length - 1 - uiKeys.keyToIndex( val ) ]
			: this._rowsById[ val ];
	},
	_rowIndexByData( data ) {
		return data.track
			? this._rowIndexByElement( this._rowsById[ data.track ] )
			: this.uiKeys.rowElements.length - this.uiKeys.keyToIndex( data.key ) - 1;
	},
	_rowIndexByElement( row ) {
		return row.dataset.rowid
			? +row.dataset.rowid
			: Array.from( this.rows ).indexOf( row );
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
		this._mdBeat = this._getMouseBeat( e.pageX );
		gsuiGridSamples._focused = this;
		if ( e.shiftKey ) {
			this._selectionIsStarting = true;
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
	_evmdRow( elRow, e ) {
		if ( !this._bcClicked && !e.shiftKey && !e.ctrlKey && !e.altKey ) {
			if ( e.button === 2 ) {
				this._deletionStarted();
			} else if ( e.button === 0 && this.uiKeys ) {
				var id = gsuiGridSamples.getNewId(),
					obj = this._bcUnselectAll(),
					data = {
						key: elRow.dataset.key + elRow.dataset.octave,
						when: this._getMouseBeat( e.pageX ),
						offset: 0,
						duration: this._bcLastDur || 1
					};

				obj[ id ] = data;
				this._bcCreate( id, data );
				this.onchange( obj );
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
		} else if ( this._deletionObj ) {
			this._deletionPush( e.target.gsuiAudioBlock && e.target.gsuiAudioBlock.id );
		} else if ( this._selectionIsStarted ) {
			this._selectionStarted( e );
		} else if ( this._selectionIsStarting ) {
			this._selectionStarting( e, pxRel, pyRel );
		}
	},
	_evmuRoot() {
		this._selectionEnd();
		this._deletionEnd();
		this._elPanelExt.classList.remove( "gsui-hover" );
		delete this._bcClicked;
		delete this._gridDragging;
		delete this._panelResizing;
		delete gsuiGridSamples._focused;
	},
	_evkdRoot( e ) {
		switch ( e.code ) {
			case "KeyA":
				if ( e.ctrlKey ) {
					this._callOnchange( this._bcSelectAll() );
				}
				break;
			case "KeyD":
				if ( e.ctrlKey ) {
					this._callOnchange( this._bcUnselectAll() );
					return false;
				}
				break;
			case "Delete":
				this._deletionObj = {};
				for ( var id in this._bcSelected ) {
					this._deletionPush( id );
				}
				this._deletionEnd();
				break;
		}
	}
};
