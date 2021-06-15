"use strict";

class gsuiPatternroll extends HTMLElement {
	#rowsByTrackId = new Map()
	#tracklist = new gsuiTracklist()
	#selectionElement = GSUI.createElement( "div", { class: "gsuiBlocksManager-selection gsuiBlocksManager-selection-hidden" } )
	#win = GSUI.createElement( "gsui-timewindow", {
		panelsize: 90,
		panelsizemin: 24,
		panelsizemax: 160,
		lineheight: 40,
		lineheightmin: 20,
		lineheightmax: 68,
		pxperbeat: 32,
		pxperbeatmin: 8,
		pxperbeatmax: 160,
	} )
	#blcManager = new gsuiBlocksManager( {
		rootElement: this,
		selectionElement: this.#selectionElement,
		timeline: this.#win.timeline,
		blockDOMChange: this.#blockDOMChange.bind( this ),
		managercallMoving: ( blcsMap, wIncr, trIncr ) => this.onchange( "move", Array.from( blcsMap.keys() ), wIncr, trIncr ),
		managercallDeleting: blcsMap => this.onchange( "deletion", Array.from( blcsMap.keys() ) ),
		managercallSelecting: ids => this.onchange( "selection", ids ),
		managercallUnselecting: () => this.onchange( "unselection" ),
		managercallUnselectingOne: blcId => this.onchange( "unselectionOne", blcId ),
		managercallDuplicating: ( blcsMap, wIncr ) => this.onchange( "duplicate", wIncr ),
		managercallCroppingA: ( blcsMap, wIncr ) => this.onchange( "cropStart", Array.from( blcsMap.keys() ), wIncr ),
		managercallCroppingB: ( blcsMap, wIncr ) => this.onchange( "cropEnd", Array.from( blcsMap.keys() ), wIncr ),
	} )

	constructor() {
		super();
		this.timeline = this.#win.timeline;
		this.onchange =
		this.onaddBlock =
		this.oneditBlock = null;
		Object.seal( this );

		GSUI.listenEvents( this, {
			gsuiTimewindow: {
				pxperbeat: d => this.#ongsuiTimewindowPxperbeat( d.args[ 0 ] ),
				lineheight: d => this.#ongsuiTimewindowLineheight( d.args[ 0 ] ),
			},
		} );
		this.#ongsuiTimewindowPxperbeat( 32 );
		this.#ongsuiTimewindowLineheight( 40 );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			GSUI.setAttribute( this, "tabindex", -1 );
			this.classList.add( "gsuiBlocksManager", "gsuiPatternroll" );
			this.append( this.#win );
			this.#win.querySelector( ".gsuiTimewindow-panelContent" ).append( this.#tracklist.rootElement );
			this.#win.querySelector( ".gsuiTimewindow-mainContent" ).append( this.#selectionElement );
			this.#win.querySelector( ".gsuiTimewindow-rows" ).ondrop = this.#drop.bind( this );
			this.#win.querySelector( "gsui-beatlines" ).removeAttribute( "coloredbeats" );
		}
	}

	// .........................................................................
	addTrack( id ) {
		const elTrack = this.#tracklist.addTrack( id ),
			row = elTrack.rowElement;

		row.classList.toggle( "gsui-row-small", this.#blcManager.__pxPerBeat <= 44 );
		row.onmousedown = this.#rowMousedown.bind( this );
		this.#rowsByTrackId.set( row.dataset.id, row );
		this.#win.querySelector( ".gsuiTimewindow-rows" ).append( row );
	}
	removeTrack( id ) { this.#tracklist.removeTrack( id ); }
	toggleTrack( id, b ) { GSUI.setAttribute( this.#tracklist.getTrack( id ), "toggle", b ); }
	renameTrack( id, s ) { GSUI.setAttribute( this.#tracklist.getTrack( id ), "name", s ); }
	reorderTrack( id, n ) { GSUI.setAttribute( this.#tracklist.getTrack( id ), "order", n ); }

	// .........................................................................
	addBlock( id, obj ) {
		const elBlc = GSUI.getTemplate( "gsui-patternroll-block" );

		elBlc.dataset.id = id;
		elBlc.dataset.pattern = obj.pattern;
		elBlc.onmousedown = this.#blcMousedown.bind( this, id );
		this.#blcManager.__blcs.set( id, elBlc );
		this.onaddBlock( id, obj, elBlc );
	}
	removeBlock( id ) {
		this.#blcManager.__blcs.get( id ).remove();
		this.#blcManager.__blcs.delete( id );
		this.#blcManager.__blcsSelected.delete( id );
	}
	changeBlockProp( id, prop, val ) {
		const blc = this.#blcManager.__blcs.get( id );

		this.#blockDOMChange( blc, prop, val );
		if ( prop === "track" ) {
			blc.dataset.track = val;
		} else if ( prop === "selected" ) {
			val
				? this.#blcManager.__blcsSelected.set( id, blc )
				: this.#blcManager.__blcsSelected.delete( id );
		}
	}
	updateBlockViewBox( id, obj ) {
		this.oneditBlock( id, obj, this.#blcManager.__blcs.get( id ) );
	}

	// .........................................................................
	setData( data ) {
		this.#blcManager.setData( data );
	}
	setCallbacks( cb ) {
		this.onchange = cb.onchange;
		this.onaddBlock = cb.onaddBlock;
		this.oneditBlock =
		this.#blcManager._opts.oneditBlock = cb.oneditBlock;
	}
	getBlocks() {
		return this.#blcManager.__blcs;
	}
	timeDivision( a, b ) {
		GSUI.setAttribute( this.#win, "timedivision", `${ a }/${ b }` );
	}
	currentTime( t ) {
		GSUI.setAttribute( this.#win, "currenttime", t );
	}
	loop( a, b ) {
		GSUI.setAttribute( this.#win, "loop", Number.isFinite( a ) && `${ a }-${ b }` );
	}

	// .........................................................................
	#blockDOMChange( el, prop, val ) {
		switch ( prop ) {
			case "when": el.style.left = `${ val }em`; break;
			case "duration": el.style.width = `${ val }em`; break;
			case "deleted": el.classList.toggle( "gsuiBlocksManager-block-hidden", !!val ); break;
			case "selected": el.classList.toggle( "gsuiBlocksManager-block-selected", !!val ); break;
			case "row": this.#blockDOMChange( el, "track", this.#incrTrackId( el.dataset.track, val ) ); break;
			case "track": {
				const row = this.#getRowByTrackId( val );

				row && row.firstElementChild.append( el );
			} break;
		}
	}

	// .........................................................................
	#getRowByTrackId( id ) { return this.#rowsByTrackId.get( id ); }
	#incrTrackId( id, incr ) {
		const row = this.#getRowByTrackId( id ),
			rowInd = this.#blcManager.__getRowIndexByRow( row ) + incr;

		return this.#blcManager.__getRowByIndex( rowInd ).dataset.id;
	}

	// .........................................................................
	#ongsuiTimewindowPxperbeat( ppb ) {
		this.#blcManager.__pxPerBeat = ppb;
	}
	#ongsuiTimewindowLineheight( px ) {
		this.#blcManager.__fontSize = px;
		Array.from( this.#blcManager.__rows ).forEach( el => el.classList.toggle( "gsui-row-small", px <= 44 ) );
	}

	// .........................................................................
	#rowMousedown( e ) {
		this.#blcManager.__mousedown( e );
		if ( e.button === 0 && !e.shiftKey && this.#blcManager.__blcsSelected.size ) {
			this.onchange( "unselection" );
		}
	}
	#blcMousedown( id, e ) {
		e.stopPropagation();
		this.#blcManager.__mousedown( e );
	}
	#drop( e ) {
		const dropData = (
				e.dataTransfer.getData( "pattern-buffer" ) ||
				e.dataTransfer.getData( "pattern-drums" ) ||
				e.dataTransfer.getData( "pattern-keys" ) ).split( ":" );

		if ( dropData.length === 2 ) {
			const padId = dropData[ 0 ],
				when = this.#blcManager.__roundBeat( this.#blcManager.__getWhenByPageX( e.pageX ) ),
				track = this.#blcManager.__getRowByIndex( this.#blcManager.__getRowIndexByPageY( e.pageY ) ).dataset.id;

			this.onchange( "add", padId, when, track );
		}
	}
}

customElements.define( "gsui-patternroll", gsuiPatternroll );

Object.freeze( gsuiPatternroll );
