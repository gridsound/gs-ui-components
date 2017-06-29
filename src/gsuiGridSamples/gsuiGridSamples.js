"use strict";

function gsuiGridSamples() {
	var root = this._clone();

	this.rootElement = root;
	this._elPanel = root.querySelector( ".gsui-panel" );
	this._elGrid = root.querySelector( ".gsui-grid" );
	this._elGridCnt = this._elGrid.querySelector( ".gsui-content" );
	this._elPanelExt = this._elPanel.querySelector( ".gsui-extend" );
	this._elPanelCnt = this._elPanel.querySelector( ".gsui-content" );
	this.uiTimeLine = new gsuiTimeLine();
	this.uiBeatLines = new gsuiBeatLines();
	root.prepend( this.uiTimeLine.rootElement );
	this._elGrid.prepend( this.uiBeatLines.rootElement );

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
	this.setFontSize( 40 );
	this.panelWidth( 100 );
}

gsuiGridSamples.prototype = {
	resized() {
		var panelStyle = getComputedStyle( this._elPanel );

		this.width = this.rootElement.clientWidth;
		this._panelMinWidth = parseFloat( panelStyle.minWidth );
		this._panelMaxWidth = parseFloat( panelStyle.maxWidth ) || this.width;
		this._resizeGrid();
		this._updateGrid();
	},
	offset( offset, beatPx ) {
		this._timeOffset = offset;
		this._pxPerBeat = beatPx;
		this._updateGrid();
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
	setFontSize( emPx ) {
		this._fontSize = ~~Math.min( Math.max( 16, emPx ), 256 );
		this.rootElement.style.fontSize = this._fontSize + "px";
	},
	loadKeys() {
		this._loadPanelCmp( "uiKeys", "uiTrackList" );
	},
	loadTrackList() {
		this._loadPanelCmp( "uiTrackList", "uiKeys" );
	},
	nbOctaves( from, nbOct ) {
		if ( this.uiKeys ) {
			this.uiKeys.octaves( from, nbOct );
			this._addRows( this.uiKeys );
		}
	},
	nbTracks( n ) {
		if ( this.uiTrackList ) {
			this.uiTrackList.nbTracks( n );
			this._addRows( this.uiTrackList );
		}
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
			oldCmp[ oldCmpStr === "uiKeys" ? "octaves" : "nbTracks" ]( 0, 0 );
			oldCmp.rootElement.remove();
			this.setFontSize( this._fontSize * ( oldCmpStr === "uiKeys" ? 1.5 : 2 / 3 ) );
			delete this[ oldCmpStr ];
		}
		if ( !cmp ) {
			this[ cmpStr ] = cmp = cmpStr === "uiKeys" ? new gsuiKeys() : new gsuiTrackList();
			this._elPanelCnt.prepend( cmp.rootElement );
		}
	},
	_addRows( cmp ) {
		cmp.newRowElements.forEach( this._elGridCnt.appendChild.bind( this._elGridCnt ) );
	},
	_resizeGrid() {
		this.uiTimeLine.resized();
		this.uiBeatLines.resized();
	},
	_contentScroll( e ) {
		this.contentY( this._contentY + ( 20 * ( e.deltaY > 0 ? 1 : -1 ) ) / this._fontSize );
	},
	_updateGrid() {
		this.uiTimeLine.offset( this._timeOffset, this._pxPerBeat );
		this.uiBeatLines.offset( this._timeOffset, this._pxPerBeat );
		this._timeOffset = this.uiTimeLine._offset;
		this._pxPerBeat = this.uiTimeLine._pxPerBeat;
	},
	_updatePanelSize() {
		this._elPanel.style.width =
		this._elGrid.style.left = this._panelWidth + "px";
		this.uiTimeLine.rootElement.style.left = this._panelWidth - 1 + "px";
		this._resizeGrid();
		this._updateGrid();
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
		if ( e.altKey ) {
			this._gridDragging = true;
			this._mouseOffset = this._timeOffset;
			this._mouseContentY = this._contentY;
			this._mousePageX = e.pageX;
			this._mousePageY = e.pageY;
			gsuiGridSamples._focused = this;
		}
	},
	_evmdPanelEx( e ) {
		this._rootLeft = this.rootElement.getBoundingClientRect().left;
		this._panelResizing = this._elPanelExt.clientWidth - e.layerX;
		this._elPanelExt.classList.add( "gsui-hover" );
		gsuiGridSamples._focused = this;
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
			this.offset( Math.max( 0, this._timeOffset + offInc ), beatPx );
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
		if ( this._gridDragging ) {
			var of = ( e.pageX - this._mousePageX ) / this._pxPerBeat,
				cy = ( e.pageY - this._mousePageY ) / this._fontSize;

			this.offset( this._mouseOffset - of, this._pxPerBeat );
			this.contentY( this._mouseContentY - cy );
		} else if ( this._panelResizing != null ) {
			this.panelWidth( e.pageX - this._rootLeft + this._panelResizing );
		}
	},
	_evmuRoot( e ) {
		this._elPanelExt.classList.remove( "gsui-hover" );
		delete this._gridDragging;
		delete this._panelResizing;
		delete gsuiGridSamples._focused;
	}
};
