"use strict";

class gsuiPatternroll extends HTMLElement {
	#rowsByTrackId = new Map();
	#tracklist = GSUI.$createElement( "gsui-tracklist" );
	#selectionElement = GSUI.$createElement( "div", { class: "gsuiBlocksManager-selection gsuiBlocksManager-selection-hidden" } );
	#win = GSUI.$createElement( "gsui-timewindow", {
		panelsize: 90,
		panelsizemin: 24,
		panelsizemax: 160,
		lineheight: 40,
		lineheightmin: 20,
		lineheightmax: 68,
		pxperbeat: 32,
		pxperbeatmin: 8,
		pxperbeatmax: 160,
	} );
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
	} );

	constructor() {
		super();
		this.timeline = this.#win.timeline;
		this.onchange =
		this.onaddBlock =
		this.oneditBlock = null;
		Object.seal( this );

		GSUI.$listenEvents( this, {
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
			this.classList.add( "gsuiBlocksManager" );
			GSUI.$setAttribute( this, "tabindex", -1 );
			this.append( this.#win );
			this.#win.querySelector( ".gsuiTimewindow-panelContent" ).append( this.#tracklist );
			this.#win.querySelector( ".gsuiTimewindow-mainContent" ).append( this.#selectionElement );
			this.#win.querySelector( ".gsuiTimewindow-rows" ).ondrop = this.#drop.bind( this );
			this.#win.querySelector( "gsui-beatlines" ).removeAttribute( "coloredbeats" );
		}
	}
	static get observedAttributes() {
		return [ "currenttime" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "currenttime":
					GSUI.$setAttribute( this.#win, "currenttime", val );
					break;
			}
		}
	}

	// .........................................................................
	addTrack( id ) {
		const elTrack = this.#tracklist.addTrack( id );
		const row = elTrack.rowElement;

		row.classList.toggle( "gsui-row-small", this.#blcManager.getFontSize() <= 44 );
		row.onmousedown = this.#rowMousedown.bind( this );
		this.#rowsByTrackId.set( row.dataset.id, row );
		this.#win.querySelector( ".gsuiTimewindow-rows" ).append( row );
	}
	removeTrack( id ) { this.#tracklist.removeTrack( id ); }
	toggleTrack( id, b ) { GSUI.$setAttribute( this.#tracklist.getTrack( id ), "mute", !b ); }
	renameTrack( id, s ) { GSUI.$setAttribute( this.#tracklist.getTrack( id ), "name", s ); }
	reorderTrack( id, n ) { GSUI.$setAttribute( this.#tracklist.getTrack( id ), "order", n ); }

	// .........................................................................
	addBlock( id, obj, { dataReady } ) {
		const elBlc = GSUI.$getTemplate( "gsui-patternroll-block" );

		elBlc.dataset.id = id;
		elBlc.dataset.pattern = obj.pattern;
		elBlc.onmousedown = this.#blcMousedown.bind( this, id );
		GSUI.$setAttribute( elBlc, "data-missing", !dataReady );
		this.#blcManager.getBlocks().set( id, elBlc );
		this.onaddBlock( id, obj, elBlc );
	}
	removeBlock( id ) {
		this.#blcManager.getBlocks().get( id ).remove();
		this.#blcManager.getBlocks().delete( id );
		this.#blcManager.getSelectedBlocks().delete( id );
	}
	changeBlockProp( id, prop, val ) {
		const blc = this.#blcManager.getBlocks().get( id );

		this.#blockDOMChange( blc, prop, val );
		if ( prop === "track" ) {
			blc.dataset.track = val;
		} else if ( prop === "selected" ) {
			val
				? this.#blcManager.getSelectedBlocks().set( id, blc )
				: this.#blcManager.getSelectedBlocks().delete( id );
		}
	}
	updateBlockViewBox( id, obj ) {
		this.oneditBlock( id, obj, this.#blcManager.getBlocks().get( id ) );
	}

	// .........................................................................
	setData( data ) {
		this.#blcManager.setData( data );
	}
	setCallbacks( cb ) {
		this.onchange = cb.onchange;
		this.onaddBlock = cb.onaddBlock;
		this.oneditBlock = cb.oneditBlock;
		this.#blcManager.getOpts().oneditBlock = cb.oneditBlock;
	}
	getBlocks() {
		return this.#blcManager.getBlocks();
	}
	timedivision( timediv ) {
		GSUI.$setAttribute( this.#win, "timedivision", timediv );
	}
	loop( a, b ) {
		GSUI.$setAttribute( this.#win, "loop", Number.isFinite( a ) && `${ a }-${ b }` );
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
		const row = this.#getRowByTrackId( id );
		const rowInd = this.#blcManager.getRowIndexByRow( row ) + incr;

		return this.#blcManager.getRowByIndex( rowInd ).dataset.id;
	}

	// .........................................................................
	#ongsuiTimewindowPxperbeat( ppb ) {
		this.#blcManager.setPxPerBeat( ppb );
	}
	#ongsuiTimewindowLineheight( px ) {
		this.#blcManager.setFontSize( px );
		Array.from( this.#blcManager.getRows() ).forEach( el => el.classList.toggle( "gsui-row-small", px <= 44 ) );
	}

	// .........................................................................
	#rowMousedown( e ) {
		this.#blcManager.onmousedown( e );
		if ( e.button === 0 && !e.shiftKey && this.#blcManager.getSelectedBlocks().size ) {
			this.onchange( "unselection" );
		}
	}
	#blcMousedown( id, e ) {
		e.stopPropagation();
		this.#blcManager.onmousedown( e );
	}
	#drop( e ) {
		const padId =
				e.dataTransfer.getData( "pattern-buffer" ) ||
				e.dataTransfer.getData( "pattern-slices" ) ||
				e.dataTransfer.getData( "pattern-drums" ) ||
				e.dataTransfer.getData( "pattern-keys" );

		if ( padId ) {
			const when = this.#blcManager.roundBeat( this.#blcManager.getWhenByPageX( e.pageX ) );
			const track = this.#blcManager.getRowByIndex( this.#blcManager.getRowIndexByPageY( e.pageY ) ).dataset.id;

			this.onchange( "add", padId, when, track );
		}
	}
}

Object.freeze( gsuiPatternroll );
customElements.define( "gsui-patternroll", gsuiPatternroll );
