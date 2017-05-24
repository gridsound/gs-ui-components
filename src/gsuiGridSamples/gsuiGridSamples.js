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
	this._elGrid.onwheel = this._evowGrid.bind( this );
	this.uiTimeLine.onchangeCurrentTime = this._evocCurrentTime.bind( this );
	this.uiTimeLine.oninputLoop = this._evoiLoop.bind( this );
	this._fontSize = 40;
	root.style.fontSize = this._fontSize + "px";
	this._panelMaxWidth = Infinity;
	this._contentY =
	this._panelMinWidth =
	this._timeOffset = 0;
	this._pxPerBeat = 80;
	this.panelWidth( 100 );
}

gsuiGridSamples.prototype = {
	loadPianoRoll() {
		// ...
	},
	loadTrackList() {
		this.uiTrackList = new gsuiTrackList();
		this._elPanelCnt.prepend( this.uiTrackList.rootElement );
	},
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
	currentTime( beat ) {
		this.uiTimeLine.currentTime( beat );
		this.uiBeatLines.currentTime( beat );
	},
	loop( a, b ) {
		this.uiTimeLine.loop( a, b );
		this.uiBeatLines.loop( a, b );
	},
	nbTracks( n ) {
		if ( this.uiTrackList ) {
			var trkRoot,
				nl = this.uiTrackList.tracksNodeList,
				i = nl.length;

			this.uiTrackList.nbTracks( n );
			while ( trkRoot = nl[ i++ ] ) {
				this._elGridCnt.append( trkRoot.gsuiTrackObject.gridTrackElement );
			}
		}
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
		var h = this.uiTrackList.rootElement.clientHeight;

		h = Math.max( 0, h - this._elGrid.clientHeight ) / this._fontSize;
		this._contentY = yEm = Math.min( Math.max( 0, yEm ), h );
		this._elGridCnt.style.marginTop =
		this._elPanelCnt.style.marginTop = -yEm + "em";
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
			gsuiGridSamples._focused && gsuiGridSamples._focused._evmm( e );
		} );
		document.body.addEventListener( "mouseup", function( e ) {
			gsuiGridSamples._focused && gsuiGridSamples._focused._evmu( e );
		} );
		return document.getElementById( "gsuiGridSamples" );
	},
	_resizeGrid() {
		this.uiTimeLine.resized();
		this.uiBeatLines.resized();
	},
	_updateGrid() {
		this.uiTimeLine.offset( this._timeOffset, this._pxPerBeat );
		this.uiBeatLines.offset( this._timeOffset, this._pxPerBeat );
	},
	_updatePanelSize() {
		this._elPanel.style.width =
		this._elGrid.style.left = this._panelWidth + "px";
		this.uiTimeLine.rootElement.style.left = this._panelWidth - 1 + "px";
		this._resizeGrid();
		this._updateGrid();
	},

	// events :
	_evocCurrentTime( beat ) {
		this.uiBeatLines.currentTime( beat );
		this.onchangeCurrentTime && this.onchangeCurrentTime( beat );
	},
	_evoiLoop( toggle, a, b ) {
		this.uiBeatLines.loop( toggle && a, b );
		this.oninputLoop && this.oninputLoop( toggle, a, b );
	},
	_evowGrid( e ) {
		var offInc,
			dpos = e.deltaY > 0,
			beatPx = this._pxPerBeat;

		if ( !e.shiftKey && !e.ctrlKey ) {
			this.contentY( this._contentY + ( 20 * ( dpos ? 1 : -1 ) ) / this._fontSize );
		} else {
			if ( e.ctrlKey ) {
				beatPx = Math.min( Math.max( 8, beatPx * ( dpos ? .9 : 1.1 ) ), 512 );
				offInc = ( e.layerX / this._pxPerBeat * ( beatPx - this._pxPerBeat ) ) / beatPx;
			} else {
				offInc = ( dpos ? 40 : -40 ) / beatPx;
			}
			this.offset( Math.max( 0, this._timeOffset + offInc ), beatPx );
		}
		return false;
	},
	_evmu( e ) {
		this._elPanelExt.classList.remove( "gsui-hover" );
		delete this._panelResizing;
		delete gsuiGridSamples._focused;
	},
	_evmm( e ) {
		if ( this._panelResizing != null ) {
			this.panelWidth( e.clientX - this._rootLeft + this._panelResizing );
		}
	},
	_evmdPanelEx( e ) {
		this._rootLeft = this.rootElement.getBoundingClientRect().left;
		this._panelResizing = this._elPanelExt.clientWidth - e.layerX;
		this._elPanelExt.classList.add( "gsui-hover" );
		gsuiGridSamples._focused = this;
	}
};
