"use strict";

class gsuiPatternroll {
	constructor( cb ) {
		const root = gsuiPatternroll.template.cloneNode( true ),
			win = GSUI.createElement( "gsui-timewindow", {
				panelsize: 90,
				panelsizemin: 24,
				panelsizemax: 160,
				lineheight: 40,
				lineheightmin: 20,
				lineheightmax: 68,
				pxperbeat: 32,
				pxperbeatmin: 8,
				pxperbeatmax: 160,
			} ),
			selectionElement = GSUI.createElement( "div", { class: "gsuiBlocksManager-selection gsuiBlocksManager-selection-hidden" } ),
			blcManager = new gsuiBlocksManager( {
				rootElement: root,
				selectionElement,
				timeline: win._elTimeline,
				blockDOMChange: this._blockDOMChange.bind( this ),
				managercallMoving: ( blcsMap, wIncr, trIncr ) => this.onchange( "move", Array.from( blcsMap.keys() ), wIncr, trIncr ),
				managercallDeleting: blcsMap => this.onchange( "deletion", Array.from( blcsMap.keys() ) ),
				managercallSelecting: ids => this.onchange( "selection", ids ),
				managercallUnselecting: () => this.onchange( "unselection" ),
				managercallUnselectingOne: blcId => this.onchange( "unselectionOne", blcId ),
				managercallDuplicating: ( blcsMap, wIncr ) => this.onchange( "duplicate", wIncr ),
				managercallCroppingA: ( blcsMap, wIncr ) => this.onchange( "cropStart", Array.from( blcsMap.keys() ), wIncr ),
				managercallCroppingB: ( blcsMap, wIncr ) => this.onchange( "cropEnd", Array.from( blcsMap.keys() ), wIncr ),
				...cb,
			} );

		this._win = win;
		this.rootElement = root;
		this.timeline = win._elTimeline;
		this._tracklist = new gsuiTracklist();
		this.onchange = cb.onchange;
		this.onaddBlock = cb.onaddBlock;
		this.oneditBlock = cb.oneditBlock;
		this._blcManager = blcManager;
		this._selectionElement = selectionElement;
		this._rowsByTrackId = new Map();
		Object.seal( this );

		root.addEventListener( "gsuiEvents", this._ongsuiEvents.bind( this ) );
		this._ongsuiTimewindowPxperbeat( 32 );
		this._ongsuiTimewindowLineheight( 40 );
	}

	// ........................................................................
	addTrack( id ) {
		const elTrack = this._tracklist.addTrack( id ),
			row = elTrack.rowElement;

		row.classList.toggle( "gsui-row-small", this._blcManager.__pxPerBeat <= 44 );
		row.onmousedown = this._rowMousedown.bind( this );
		this._rowsByTrackId.set( row.dataset.id, row );
		this._win.querySelector( ".gsuiTimewindow-rows" ).append( row );
	}
	removeTrack( id ) { this._tracklist.removeTrack( id ); }
	toggleTrack( id, b ) { GSUI.setAttribute( this._tracklist.getTrack( id ), "toggle", b ); }
	renameTrack( id, s ) { GSUI.setAttribute( this._tracklist.getTrack( id ), "name", s ); }
	reorderTrack( id, n ) { GSUI.setAttribute( this._tracklist.getTrack( id ), "order", n ); }

	// ........................................................................
	addBlock( id, obj ) {
		const elBlc = gsuiPatternroll.blockTemplate.cloneNode( true );

		elBlc.dataset.id = id;
		elBlc.dataset.pattern = obj.pattern;
		elBlc.onmousedown = this._blcMousedown.bind( this, id );
		this._blcManager.__blcs.set( id, elBlc );
		this.onaddBlock( id, obj, elBlc );
	}
	removeBlock( id ) {
		this._blcManager.__blcs.get( id ).remove();
		this._blcManager.__blcs.delete( id );
		this._blcManager.__blcsSelected.delete( id );
	}
	changeBlockProp( id, prop, val ) {
		const blc = this._blcManager.__blcs.get( id );

		this._blockDOMChange( blc, prop, val );
		if ( prop === "track" ) {
			blc.dataset.track = val;
		} else if ( prop === "selected" ) {
			val
				? this._blcManager.__blcsSelected.set( id, blc )
				: this._blcManager.__blcsSelected.delete( id );
		}
	}
	updateBlockViewBox( id, obj ) {
		this.oneditBlock( id, obj, this._blcManager.__blcs.get( id ) );
	}

	// ........................................................................
	attached() {
		this.rootElement.append( this._win );
		this._win.querySelector( ".gsuiTimewindow-panelContent" ).append( this._tracklist.rootElement );
		this._win.querySelector( ".gsuiTimewindow-mainContent" ).append( this._selectionElement );
		this._win.querySelector( ".gsuiTimewindow-rows" ).ondrop = this._drop.bind( this );
		this._win.querySelector( "gsui-beatlines" ).removeAttribute( "coloredbeats" );
	}
	getBlocks() {
		return this._blcManager.__blcs;
	}
	timeSignature( a, b ) {
		GSUI.setAttribute( this._win, "timesignature", `${ a },${ b }` );
	}
	currentTime( t ) {
		GSUI.setAttribute( this._win, "currenttime", t );
	}
	loop( a, b ) {
		GSUI.setAttribute( this._win, "loop", Number.isFinite( a ) && `${ a }-${ b }` );
	}

	// Blocks manager callback
	// ........................................................................
	_blockDOMChange( el, prop, val ) {
		switch ( prop ) {
			case "when": el.style.left = `${ val }em`; break;
			case "duration": el.style.width = `${ val }em`; break;
			case "deleted": el.classList.toggle( "gsuiBlocksManager-block-hidden", !!val ); break;
			case "selected": el.classList.toggle( "gsuiBlocksManager-block-selected", !!val ); break;
			case "row": this._blockDOMChange( el, "track", this._incrTrackId( el.dataset.track, val ) ); break;
			case "track": {
				const row = this._getRowByTrackId( val );

				row && row.firstElementChild.append( el );
			} break;
		}
	}

	// ........................................................................
	_getRowByTrackId( id ) { return this._rowsByTrackId.get( id ); }
	_incrTrackId( id, incr ) {
		const row = this._getRowByTrackId( id ),
			rowInd = this._blcManager.__getRowIndexByRow( row ) + incr;

		return this._blcManager.__getRowByIndex( rowInd ).dataset.id;
	}

	// ........................................................................
	_ongsuiEvents( e ) {
		switch ( e.detail.component ) {
			case "gsuiTimewindow":
				switch ( e.detail.eventName ) {
					case "pxperbeat": this._ongsuiTimewindowPxperbeat( e.detail.args[ 0 ] ); break;
					case "lineheight": this._ongsuiTimewindowLineheight( e.detail.args[ 0 ] ); break;
				}
				break;
		}
		e.stopPropagation();
	}
	_ongsuiTimewindowPxperbeat( ppb ) {
		this._blcManager.__pxPerBeat = ppb;
	}
	_ongsuiTimewindowLineheight( px ) {
		this._blcManager.__fontSize = px;
		Array.from( this._blcManager.__rows ).forEach( el => el.classList.toggle( "gsui-row-small", px <= 44 ) );
	}

	// ........................................................................
	_rowMousedown( e ) {
		this._blcManager.__mousedown( e );
		if ( e.button === 0 && !e.shiftKey && this._blcManager.__blcsSelected.size ) {
			this.onchange( "unselection" );
		}
	}
	_blcMousedown( id, e ) {
		e.stopPropagation();
		this._blcManager.__mousedown( e );
	}
	_drop( e ) {
		const dropData = (
				e.dataTransfer.getData( "pattern-buffer" ) ||
				e.dataTransfer.getData( "pattern-drums" ) ||
				e.dataTransfer.getData( "pattern-keys" ) ).split( ":" );

		if ( dropData.length === 2 ) {
			const padId = dropData[ 0 ],
				when = this._blcManager.__roundBeat( this._blcManager.__getWhenByPageX( e.pageX ) ),
				track = this._blcManager.__getRowByIndex( this._blcManager.__getRowIndexByPageY( e.pageY ) ).dataset.id;

			this.onchange( "add", padId, when, track );
		}
	}
}

gsuiPatternroll.template = document.querySelector( "#gsuiPatternroll-template" );
gsuiPatternroll.template.remove();
gsuiPatternroll.template.removeAttribute( "id" );
gsuiPatternroll.blockTemplate = document.querySelector( "#gsuiPatternroll-block-template" );
gsuiPatternroll.blockTemplate.remove();
gsuiPatternroll.blockTemplate.removeAttribute( "id" );
