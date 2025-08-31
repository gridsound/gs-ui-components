"use strict";

class gsuiPatternroll extends gsui0ne {
	$onchange = null;
	$onaddBlock = null;
	$oneditBlock = null;
	#rowsByTrackId = new Map();
	#tracklist = GSUcreateElement( "gsui-tracklist" );
	#selectionElement = GSUcreateDiv( { class: "gsuiBlocksManager-selection gsuiBlocksManager-selection-hidden" } );
	#win = GSUcreateElement( "gsui-timewindow", {
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
		managercallMoving: ( blcsMap, wIncr, trIncr ) => this.$onchange( "move", Array.from( blcsMap.keys() ), wIncr, trIncr ),
		managercallDeleting: blcsMap => this.$onchange( "deletion", Array.from( blcsMap.keys() ) ),
		managercallSelecting: ids => this.$onchange( "selection", ids ),
		managercallUnselecting: () => this.$onchange( "unselection" ),
		managercallUnselectingOne: blcId => this.$onchange( "unselectionOne", blcId ),
		managercallDuplicating: ( blcsMap, wIncr ) => this.$onchange( "duplicate", wIncr ),
		managercallCroppingA: ( blcsMap, wIncr ) => this.$onchange( "cropStart", Array.from( blcsMap.keys() ), wIncr ),
		managercallCroppingB: ( blcsMap, wIncr ) => this.$onchange( "cropEnd", Array.from( blcsMap.keys() ), wIncr ),
	} );

	constructor() {
		super( {
			$cmpName: "gsuiPatternroll",
			$tagName: "gsui-patternroll",
			$attributes: { tabindex: -1 },
		} );
		this.timeline = this.#win.timeline;
		Object.seal( this );
		GSUdomListen( this, {
			[ GSEV_TIMEWINDOW_PXPERBEAT ]: ( d, px ) => this.#ongsuiTimewindowPxperbeat( px ),
			[ GSEV_TIMEWINDOW_LINEHEIGHT ]: ( d, px ) => this.#ongsuiTimewindowLineheight( px ),
			[ GSEV_BLOCKSMANAGER_STARTPREVIEWAUDIO ]: GSUnoop,
			[ GSEV_BLOCKSMANAGER_STOPPREVIEWAUDIO ]: GSUnoop,
			[ GSEV_TIMELINE_INPUTLOOP ]: GSUnoop,
		} );
		this.#ongsuiTimewindowPxperbeat( 32 );
		this.#ongsuiTimewindowLineheight( 40 );
	}

	// .........................................................................
	$firstTimeConnected() {
		GSUdomAddClass( this, "gsuiBlocksManager" );
		this.append( this.#win );
		this.#win.$appendPanel( this.#tracklist );
		this.#win.$appendMain( this.#selectionElement );
		GSUdomRmAttr( GSUdomQS( this.#win, "gsui-beatlines" ), "coloredbeats" );
	}
	static get observedAttributes() {
		return [ "currenttime" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "currenttime":
				GSUdomSetAttr( this.#win, "currenttime", val );
				break;
		}
	}

	// .........................................................................
	$changeDuration( dur ) {
		GSUdomSetAttr( this.#win, "duration", dur );
	}
	$addTrack( id ) {
		const elTrack = this.#tracklist.$addTrack( id );
		const row = elTrack.rowElement;

		GSUdomTogClass( row, "gsui-row-small", this.#blcManager.$getFontSize() <= 44 );
		row.onmousedown = this.#rowMousedown.bind( this );
		this.#rowsByTrackId.set( row.dataset.id, row );
		GSUdomQS( this.#win, ".gsuiTimewindow-rows" ).append( row );
	}
	$removeTrack( id ) { this.#tracklist.$removeTrack( id ); }
	$toggleTrack( id, b ) { GSUdomSetAttr( this.#tracklist.$getTrack( id ), "mute", !b ); }
	$renameTrack( id, s ) { GSUdomSetAttr( this.#tracklist.$getTrack( id ), "name", s ); }
	$reorderTrack( id, n ) { GSUdomSetAttr( this.#tracklist.$getTrack( id ), "order", n ); }

	// .........................................................................
	$addBlock( id, obj, { dataReady } ) {
		const elBlc = GSUgetTemplate( "gsui-patternroll-block" );

		elBlc.dataset.id = id;
		elBlc.dataset.pattern = obj.pattern;
		elBlc.onmousedown = this.#blcMousedown.bind( this, id );
		GSUdomSetAttr( elBlc, "data-missing", !dataReady );
		this.#blcManager.$getBlocks().set( id, elBlc );
		this.$onaddBlock( id, obj, elBlc );
	}
	$removeBlock( id ) {
		this.#blcManager.$getBlocks().get( id ).remove();
		this.#blcManager.$getBlocks().delete( id );
		this.#blcManager.$getSelectedBlocks().delete( id );
	}
	$changeBlockProp( id, prop, val ) {
		const blc = this.#blcManager.$getBlocks().get( id );

		this.#blockDOMChange( blc, prop, val );
		switch ( prop ) {
			case "when":
			case "track": blc.dataset[ prop ] = val; break;
			case "selected":
				val
					? this.#blcManager.$getSelectedBlocks().set( id, blc )
					: this.#blcManager.$getSelectedBlocks().delete( id );
				break;
		}
	}
	$updateBlockViewBox( id, obj ) {
		this.$oneditBlock( id, obj, this.#blcManager.$getBlocks().get( id ) );
	}

	// .........................................................................
	$setData( data ) {
		this.#blcManager.$setData( data );
	}
	$setCallbacks( cb ) {
		this.$onchange = cb.$onchange;
		this.$onaddBlock = cb.$onaddBlock;
		this.$oneditBlock = cb.$oneditBlock;
		this.#blcManager.$getOpts().oneditBlock = cb.$oneditBlock;
	}
	$getBlocks() {
		return this.#blcManager.$getBlocks();
	}
	$timedivision( timediv ) {
		GSUdomSetAttr( this.#win, "timedivision", timediv );
	}
	$loop( a, b ) {
		GSUdomSetAttr( this.#win, "loop", Number.isFinite( a ) && `${ a }-${ b }` );
	}

	// .........................................................................
	#blockDOMChange( el, prop, val ) {
		switch ( prop ) {
			case "when": el.style.left = `${ val }em`; break;
			case "duration": el.style.width = `${ val }em`; break;
			case "deleted": GSUdomTogClass( el, "gsuiBlocksManager-block-hidden", !!val ); break;
			case "selected": GSUdomTogClass( el, "gsuiBlocksManager-block-selected", !!val ); break;
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
		const rowInd = this.#blcManager.$getRowIndexByRow( row ) + incr;

		return this.#blcManager.$getRowByIndex( rowInd ).dataset.id;
	}

	// .........................................................................
	#ongsuiTimewindowPxperbeat( ppb ) {
		this.#blcManager.$setPxPerBeat( ppb );
	}
	#ongsuiTimewindowLineheight( px ) {
		this.#blcManager.$setFontSize( px );
		Array.from( this.#blcManager.$getRows() ).forEach( el => GSUdomTogClass( el, "gsui-row-small", px <= 44 ) );
	}

	// .........................................................................
	#rowMousedown( e ) {
		this.#blcManager.$onmousedown( e );
		if ( e.button === 0 && !e.shiftKey && this.#blcManager.$getSelectedBlocks().size ) {
			this.$onchange( "unselection" );
		}
	}
	#blcMousedown( id, e ) {
		e.stopPropagation();
		this.#blcManager.$onmousedown( e );
	}
}

GSUdefineElement( "gsui-patternroll", gsuiPatternroll );
