"use strict";

function gsuiGridSamples() {
	var root = this._clone();

	this.rootElement = root;
	this._elPanel = root.querySelector( ".gsui-panel" );
	this._elGrid = root.querySelector( ".gsui-grid" );
	this._elPanelExtend = this._elPanel.querySelector( ".gsui-extend" );
	this.uiTimeLine = new gsuiTimeLine();
	this.uiBeatLines = new gsuiBeatLines();

	root.prepend( this.uiTimeLine.rootElement );
	this._elGrid.append( this.uiBeatLines.rootElement );
	this._elPanelExtend.onmousedown = this._evmdPanelEx.bind( this );
	this._elGrid.onwheel = this._evowGrid.bind( this );
	this.uiTimeLine.onchangeCurrentTime = this._evocCurrentTime.bind( this );
	this.uiTimeLine.oninputLoop = this._evoiLoop.bind( this );
	this._panelMinWidth = 0;
	this._timeOffset = 0;
	this._pxPerBeat = 80;
	this.panelWidth( 100 );
}

gsuiGridSamples.prototype = {
	resized() {
		this._rootLeft = this.rootElement.getBoundingClientRect().left;
		this._panelMinWidth = parseFloat( getComputedStyle( this._elPanel ).minWidth );
		this._resizeGrid();
		this._updateGrid();
	},
	panelWidth( width ) {
		width = Math.max( this._panelMinWidth, width );
		if ( this._timeOffset > 0 ) {
			this._timeOffset += ( width - this._panelWidth ) / this._pxPerBeat;
		}
		this._panelWidth = width;
		this._updatePanelSize();
	},
	offset( offset, beatPx ) {
		this._timeOffset = offset;
		this._pxPerBeat = beatPx;
		this.uiTimeLine.offset( offset, beatPx );
		this.uiBeatLines.offset( offset, beatPx );
	},
	currentTime( beat ) {
		this.uiTimeLine.currentTime( beat );
		this.uiBeatLines.currentTime( beat );
	},
	loop( a, b ) {
		this.uiTimeLine.loop( a, b );
		this.uiBeatLines.loop( a, b );
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
		if ( e.shiftKey || e.ctrlKey ) {
			var beatPx, offInc;

			if ( e.ctrlKey ) {
				beatPx = this._pxPerBeat * ( e.deltaY > 0 ? .9 : 1.1 );
				offInc = ( e.layerX / this._pxPerBeat * ( beatPx - this._pxPerBeat ) ) / beatPx;
				this._pxPerBeat = beatPx;
			} else {
				offInc = ( e.deltaY > 0 ? 40 : -40 ) / this._pxPerBeat;
			}
			this._timeOffset = Math.max( 0, this._timeOffset + offInc );
			this._updateGrid();
			return false;
		}
	},
	_evmu( e ) {
		this._elPanelExtend.classList.remove( "gsui-hover" );
		delete this._panelResizing;
		delete gsuiGridSamples._focused;
	},
	_evmm( e ) {
		if ( this._panelResizing != null ) {
			this.panelWidth( e.clientX - this._rootLeft + this._panelResizing );
		}
	},
	_evmdPanelEx( e ) {
		this._panelResizing = this._elPanelExtend.clientWidth - e.layerX;
		this._elPanelExtend.classList.add( "gsui-hover" );
		gsuiGridSamples._focused = this;
	}
};
