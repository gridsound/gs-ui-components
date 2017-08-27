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
	this._uiBlocks = {};
	this._uiBlocksSelected = {};
	this.panelWidth( 100 );
}

gsuiGridSamples.prototype = {
	empty() {
		if ( this.uiTrackList ) {
			this.uiTrackList.empty();
			this._rowsById = {};
		}
		for ( var id in this._uiBlocks ) {
			this._uiBlocks[ id ].rootElement.remove();
			delete this._uiBlocks[ id ];
			delete this._uiBlocksSelected[ id ];
		}
	},
	change( obj ) {
		if ( obj.tracks ) {
			this.uiTrackList.change( obj.tracks );
			this.uiTrackList.newRowElements.forEach( this._rowInit, this );
		} else {
			for ( var id in obj ) {
				obj[ id ]
					? this._uiBlocks[ id ]
						? this._blockUpdate( id, obj[ id ] )
						: this._blockCreate( id, obj[ id ] )
					: this._blockDelete( id );
			}
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

	// private audioBlocks methods:
	_blockCreate( id, data ) {
		var uiBlock = new gsuiAudioBlock();

		this._uiBlocks[ id ] = uiBlock;
		uiBlock.id = id;
		uiBlock.data = data;
		if ( data.key ) {
			uiBlock.datatype( "key" );
			uiBlock.name( data.key );
		} else {
			uiBlock.datatype( "keys" );
		}
		uiBlock.onmousedown = this._blockBodyDown.bind( this );
		// uiBlock.onmousemove = this._blockBodyMove.bind( this );
		// uiBlock.onmouseup = this._blockBodyUp.bind( this );
		uiBlock.onmousedownCrop = this._blockCropDown.bind( this );
		uiBlock.onmousemoveCrop = this._blockCropMove.bind( this );
		uiBlock.onmouseupCrop = this._blockCropUp.bind( this );
		this.__blockUpdate( id, data );
		if ( this.fnSampleCreate ) {
			this.fnSampleCreate( id, uiBlock );
		}
		return uiBlock;
	},
	_blockUpdate( id, data ) {
		var uiBlock = this.__blockUpdate( id, data );

		if ( this.fnSampleUpdate ) {
			this.fnSampleUpdate( id, uiBlock );
		}
	},
	__blockUpdate( id, data ) {
		var uiBlock = this._uiBlocks[ id ];

		"when" in data && uiBlock.when( data.when );
		"selected" in data && this._blockSelect( id, data.selected );
		if ( "duration" in data ) {
			uiBlock.duration( data.duration );
			uiBlock.contentWidthFixed();
		}
		if ( "track" in data || "key" in data ) {
			( "track" in data
				? this._rowsById[ data.track ]
				: this.rows[ this.rows.length - 1 - this.uiKeys.keyToIndex( data.key ) ]
			).firstChild.append( uiBlock.rootElement );
			uiBlock.setResolution( data.duration * this._pxPerBeat, this._fontSize );
		}
		return uiBlock;
	},
	_blockDelete( id ) {
		var uiBlock = this._uiBlocks[ id ];

		if ( uiBlock ) {
			uiBlock.rootElement.remove();
			delete this._uiBlocks[ id ];
			delete this._uiBlocksSelected[ id ];
			if ( this.fnSampleDelete ) {
				this.fnSampleDelete( id, uiBlock );
			}
		}
	},
	_blockSelect( id, b ) {
		var uiBlock = this._uiBlocks[ id ];

		uiBlock.select( b );
		if ( b ) {
			this._uiBlocksSelected[ id ] = uiBlock;
		} else {
			delete this._uiBlocksSelected[ id ];
		}
	},
	_blockForEach( uiBlock, fn ) {
		if ( uiBlock.data.selected ) {
			for ( var id in this._uiBlocksSelected ) {
				fn( this._uiBlocksSelected[ id ] );
			}
		} else {
			fn( uiBlock );
		}
	},
	_blockUnselectAll( obj ) {
		for ( var id in this._uiBlocksSelected ) {
			obj[ id ] = { selected: false };
			this._uiBlocksSelected[ id ].select( false );
			delete this._uiBlocksSelected[ id ];
		}
		return obj;
	},
	_blockCropDown( uiBlock, side, e ) {
		var id,
			minWhen = uiBlock.data.when,
			minOff = uiBlock.data.offset,
			minDur = uiBlock.data.duration,
			selection = this._uiBlocksSelected;

		if ( uiBlock.data.selected ) {
			for ( id in selection ) {
				minWhen = Math.min( minWhen, selection[ id ].data.when );
				minOff = Math.min( minOff, selection[ id ].data.offset );
				minDur = Math.min( minDur, selection[ id ].data.duration );
			}
		}
		this._cropPageX = e.pageX;
		this._cropWhenMin = minWhen;
		this._cropOffMin = minOff;
		this._cropDurMin = minDur;
		this._cropWhenRel =
		this._cropOffRel =
		this._cropDurRel = 0;
	},
	_blockCropMove( uiBlock, side, e ) {
		var whenRel, offRel, durRel,
			beatRel = this.uiTimeLine._round( ( e.pageX - this._cropPageX ) / this._pxPerBeat );

		if ( side === 1 ) {
			whenRel =
			offRel = 0;
			durRel = beatRel >= 0
				? beatRel
				: Math.max( -this._cropDurMin, beatRel );
		} else if ( beatRel < 0 ) {
			durRel = -(
				offRel =
				whenRel = Math.max( -this._cropWhenMin, beatRel ) );
			beatRel = Math.max( -this._cropOffMin, offRel );
			whenRel += beatRel - offRel;
			durRel -= beatRel - offRel;
			offRel = beatRel;
		} else {
			offRel =
			whenRel = -(
				durRel = Math.max( -this._cropDurMin, -beatRel ) );
		}
		this._cropWhenRel = whenRel;
		this._cropOffRel = offRel;
		this._cropDurRel = durRel;
		this._blockForEach( uiBlock, this.__blockCropMove.bind( this, side, whenRel, durRel ) );
	},
	__blockCropMove( side, whenRel, durRel, uiBlock ) {
		if ( !side ) {
			uiBlock.whenOffset( uiBlock.data.when + whenRel );
		}
		uiBlock.duration( uiBlock.data.duration + durRel );
	},
	_blockCropUp( uiBlock ) {
		delete this._cropPageX;
		if ( Math.abs( this._cropWhenRel ) > .0001 ||
			Math.abs( this._cropDurRel ) > .0001
		) {
			var data = {};

			this._blockForEach( uiBlock, this.__blockCropUp.bind( this, data,
				this._cropWhenRel,
				this._cropOffRel,
				this._cropDurRel ) );
			this.onchange( data );
		}
	},
	__blockCropUp( data, whenRel, offRel, durRel, uiBlock ) {
		var obj = {};

		if ( Math.abs( whenRel ) > .0001 ) {
			obj.when = uiBlock.data.when + whenRel;
			obj.offset = uiBlock.data.offset + offRel;
		}
		if ( Math.abs( durRel ) > .0001 ) {
			obj.duration = uiBlock.data.duration + durRel;
			if ( !uiBlock.data.durationEdited ) {
				obj.durationEdited = true;
			}
		}
		data[ uiBlock.id ] = obj;
	},
	_blockBodyDown( uiBlock, e ) {
		var selected,
			sel = this._uiBlocksSelected,
			id = uiBlock.id;

		this._uiBlockClicked = uiBlock;
		if ( e.button === 2 ) {
			this._deletionStarted( id );
		} else if ( e.shiftKey ) {
			selected = !sel[ id ];
			this._blockSelect( id, selected );
			this.onchange( { [ id ]: { selected: selected } } );
		} else if ( e.altKey ) {
			// copy and move the key(s)
		} else {
			this._movePageX = e.pageX;
			this._movePageY = e.pageY;
			this._moveMinY = Infinity;
			this._moveMaxY = -Infinity;
			this._moveMinX = Infinity;
			this._moveMaxX = -Infinity;
			for ( id in sel ) {
				// this._moveMinY = 0;
				// this._moveMaxY = 0;
				// this._moveMaxX = 0;
				// this._moveMinX = 0;
			}
		}
	},

	// private selection methods:
	_selectionStarting( e, pxRel, pyRel ) {
		if ( Math.max( Math.abs( pxRel ), Math.abs( pyRel ) ) > 6 ) {
			this._mdTrack =
			this._mmTrack = this._findTrack( e.pageY );
			this._selectionCalc( e.pageX );
			this._elSelection.classList.remove( "hidden" );
			this._selectionIsStarted = true;
			delete this._selectionIsStarting;
		}
	},
	_selectionStarted( e ) {
		this._mmTrack = this._findTrack( e.pageY );
		this._selectionCalc( e.pageX );
	},
	_selectionCalc( pageX ) {
		var trkA = this._mdTrack,
			trkB = this._mmTrack,
			beatA = this._getMouseBeat( pageX ),
			beatB = this._mdBeat;

		if ( trkA.compareDocumentPosition( trkB ) & 2 ) {
			trkA = trkB;
			trkB = this._mdTrack;
		}
		this._selectionDraw( trkA, trkB,
			Math.min( beatA, beatB ),
			Math.max( beatA, beatB ) );
	},
	_selectionDraw( trkA, trkB, beatA, beatB ) {
		if ( trkA !== this._selectionTrkA || trkB !== this._selectionTrkB ||
			beatA !== this._selectionBeatA || beatB !== this._selectionBeatB )
		{
			var sty = this._elSelection.style,
				top = trkA.getBoundingClientRect().top;

			this._selectionBeatA = beatA;
			this._selectionBeatB = beatB;
			this._selectionTrkA = trkA;
			this._selectionTrkB = trkB;
			sty.left = ( beatA - this._timeOffset ) * this._pxPerBeat + "px";
			sty.width = ( beatB - beatA ) * this._pxPerBeat + "px";
			sty.top = top - this._elGridCntBCR.top - this._contentY * this._fontSize + "px";
			sty.height = trkB.getBoundingClientRect().bottom - top + "px";
			this._selectionSelect();
		}
	},
	_selectionSelect( x, y, w, h ) {
		var id,
			uiBlock,
			cmp,
			cmpPos,
			trkA = this._selectionTrkA,
			trkB = this._selectionTrkB,
			beatA = this._selectionBeatA,
			beatB = this._selectionBeatB,
			uiBlocks = this._uiBlocks,
			uiBlocksSel = this._uiBlocksSelected;

		this._selectionList = [];
		for ( id in uiBlocks ) {
			uiBlock = uiBlocks[ id ];
			if ( !uiBlocksSel[ id ] ) {
				if ( cmp = beatA < uiBlock.data.when + uiBlock.data.duration &&
					uiBlock.data.when < beatB )
				{
					cmpPos = uiBlock.rootElement.compareDocumentPosition( trkA );
					if ( cmp = cmpPos & 2 || cmpPos & 8 ) {
						cmpPos = uiBlock.rootElement.compareDocumentPosition( trkB );
						cmp = cmpPos & 4 || cmpPos & 8;
					}
				}
				if ( cmp ) {
					this._selectionList.push( uiBlock );
				}
				uiBlock.select( cmp );
			}
		}
	},
	_selectionEnd() {
		if ( this._selectionIsStarted ) {
			this._elSelection.classList.add( "hidden" );
			delete this._selectionTrkA;
			delete this._selectionTrkB;
			delete this._selectionIsStarted;
			if ( this._selectionList.length > 0 ) {
				this.onchange( this._selectionList.reduce( ( obj, uiBlock ) => {
					this._uiBlocksSelected[ uiBlock.id ] = uiBlock;
					obj[ uiBlock.id ] = { selected: true };
					return obj;
				}, {} ) );
			}
		}
		delete this._selectionIsStarting;
	},

	// private deletion methods:
	_deletionStarted( id ) {
		this._deletionObj = id ? {} : this._blockUnselectAll( {} );
		id && this._deletionPush( id );
	},
	_deletionPush( id ) {
		if ( id ) { // ???
			this._deletionObj[ id ] = null;
			this._blockDelete( id );
		}
	},
	_deletionEnd() {
		if ( this._deletionObj ) {
			for ( var k in this._deletionObj ) {
				this.onchange( this._deletionObj );
				break;
			}
			delete this._deletionObj;
		}
	},

	// private row methods:
	_rowInit( elRow, i ) {
		var addData,
			keys = this.uiKeys;

		if ( keys ) {
			addData = keys._octStart + keys._nbOct - 1 - ~~( i / 12 );
		}
		elRow.onmousedown = this._evmdRow.bind( this, elRow, addData );
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
	_evmdRow( elRow, octave, e ) {
		if ( !this._uiBlockClicked && !e.shiftKey && !e.ctrlKey && !e.altKey ) {
			if ( e.button === 2 ) {
				this._deletionStarted();
			} else if ( e.button === 0 && this.uiKeys ) {
				var id = gsuiGridSamples.getNewId(),
					data = {
						key: elRow.dataset.key + octave,
						when: this._getMouseBeat( e.pageX ),
						offset: 0,
						duration: 1
					};

				this._blockCreate( id, data );
				this.onchange( this._blockUnselectAll( { [ id ]: data } ) );
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
		delete this._uiBlockClicked;
		delete this._gridDragging;
		delete this._panelResizing;
		delete gsuiGridSamples._focused;
	},
	_evkdRoot( e ) {
		switch ( e.code ) {
			case "Delete":
				this._deletionObj = {};
				for ( var id in this._uiBlocksSelected ) {
					this._deletionPush( id );
				}
				this._deletionEnd();
				break;
		}
	}
};
