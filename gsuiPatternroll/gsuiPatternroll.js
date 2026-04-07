"use strict";

class gsuiPatternroll extends gsui0ne {
	#onchange = null;
	#onaddBlock = null;
	#oneditBlock = null;
	#rowsByTrackId = new Map();
	#tracklist = $( "<gsui-tracklist>" );
	#selectionElement = $( "<div>" ).$addClass( "gsuiBlocksManager-selection", "gsuiBlocksManager-selection-hidden" );
	#win = $( "<gsui-timewindow>" ).$setAttr( {
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
		$rootElement: this.$this,
		$selectionElement: this.#selectionElement,
		$timeline: this.#win.$get( 0 ).$getTimeline(),
		$blockDOMChange: this.#blockDOMChange.bind( this ),
		$managercallMoving: ( blcsMap, wIncr, trIncr ) => this.#onchange( "move", Array.from( blcsMap.keys() ), wIncr, trIncr ),
		$managercallDeleting: blcsMap => this.#onchange( "deletion", Array.from( blcsMap.keys() ) ),
		$managercallSelecting: ids => this.#onchange( "selection", ids ),
		$managercallUnselecting: () => this.#onchange( "unselection" ),
		$managercallUnselectingOne: blcId => this.#onchange( "unselectionOne", blcId ),
		$managercallDuplicating: ( blcsMap, wIncr ) => this.#onchange( "duplicate", wIncr ),
		$managercallCroppingA: ( blcsMap, wIncr ) => this.#onchange( "cropStart", Array.from( blcsMap.keys() ), wIncr ),
		$managercallCroppingB: ( blcsMap, wIncr ) => this.#onchange( "cropEnd", Array.from( blcsMap.keys() ), wIncr ),
	} );

	constructor() {
		super( {
			$tagName: "gsui-patternroll",
			$attributes: { tabindex: -1 },
		} );
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
		this.$this
			.$addClass( "gsuiBlocksManager" )
			.$append( this.#win );
		this.#win.$get( 0 ).$appendPanel( this.#tracklist.$get( 0 ) );
		this.#win.$get( 0 ).$appendMain( this.#selectionElement.$get( 0 ) );
	}
	static get observedAttributes() {
		return [ "currenttime" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "currenttime":
				this.#win.$setAttr( "currenttime", val );
				break;
		}
	}

	// .........................................................................
	$changeDuration( dur ) {
		this.#win.$setAttr( "duration", dur );
	}
	$addTrack( id ) {
		const row = this.#tracklist.$get( 0 ).$addTrack( id ).$message( GSEV_TRACK_ROWELEMENT );

		row.$setAttr( "data-small", this.#blcManager.$getFontSize() <= 44 )
			.$on( "pointerdown", this.#rowMousedown.bind( this ) )
			.$appendTo( this.#win.$query( ".gsuiTimewindow-rows" ) );
		this.#rowsByTrackId.set( id, row );
	}
	$removeTrack( id ) { this.#tracklist.$get( 0 ).$removeTrack( id ); }
	$toggleTrack( id, b ) { this.#tracklist.$get( 0 ).$getTrack( id ).$setAttr( "mute", !b ); }
	$renameTrack( id, s ) { this.#tracklist.$get( 0 ).$getTrack( id ).$setAttr( "name", s ); }
	$reorderTrack( id, n ) { this.#tracklist.$get( 0 ).$getTrack( id ).$setAttr( "order", n ); }

	// .........................................................................
	$addBlock( id, obj, { dataReady } ) {
		const elBlc = $( GSUgetTemplate( "gsui-patternroll-block" ) )
			.$dataId( id )
			.$on( "pointerdown", this.#blcMousedown.bind( this, id ) )
			.$setAttr( {
				"data-pattern": obj.pattern,
				"data-missing": !dataReady,
				"data-type": obj.type,
			} );

		this.#blcManager.$getBlocks().set( id, elBlc );
		this.#onaddBlock( id, obj, elBlc );
	}
	$removeBlock( id ) {
		this.#blcManager.$getBlocks().get( id ).$remove();
		this.#blcManager.$getBlocks().delete( id );
		this.#blcManager.$getSelectedBlocks().delete( id );
	}
	$changeBlockProp( id, prop, val ) {
		const blc = this.#blcManager.$getBlocks().get( id );

		this.#blockDOMChange( blc, prop, val );
		switch ( prop ) {
			case "when": blc.$setAttr( "data-when", val ); break;
			case "track": blc.$setAttr( "data-track", val ); break;
			case "selected":
				val
					? this.#blcManager.$getSelectedBlocks().set( id, blc )
					: this.#blcManager.$getSelectedBlocks().delete( id );
				break;
		}
	}
	$updateBlockViewBox( id, obj ) {
		this.#oneditBlock( id, obj, this.#blcManager.$getBlocks().get( id ) );
	}

	// .........................................................................
	$setData( data ) {
		this.#blcManager.$setData( data );
	}
	$setCallbacks( cb ) {
		this.#onchange = cb.$onchange;
		this.#onaddBlock = cb.$onaddBlock;
		this.#oneditBlock = cb.$oneditBlock;
		this.#blcManager.$getOpts().$oneditBlock = cb.$oneditBlock;
		this.#blcManager.$getOpts().$getBlockPatternDuration = cb.$getBlockPatternDuration;
	}
	$getBlocks() {
		return this.#blcManager.$getBlocks();
	}
	$timedivision( timediv ) {
		this.#win.$setAttr( "timedivision", timediv );
	}
	$loop( a, b ) {
		this.#win.$setAttr( "loop", Number.isFinite( a ) && `${ a }-${ b }` );
	}

	// .........................................................................
	#blockDOMChange( el, prop, val ) {
		switch ( prop ) {
			case "when": el.$left( val, "em" ); break;
			case "duration": el.$width( val, "em" ); break;
			case "deleted": el.$setAttr( "data-hidden", !!val ); break;
			case "selected": el.$setAttr( "data-selected", !!val ); break;
			case "row": this.#blockDOMChange( el, "track", this.#incrTrackId( el.$getAttr( "data-track" ), val ) ); break;
			case "track": el.$appendTo( this.#rowsByTrackId.get( val )?.$child( 0 ) ); break;
		}
	}

	// .........................................................................
	#incrTrackId( id, incr ) {
		const row = this.#rowsByTrackId.get( id );
		const rowInd = row.$index() + incr;

		return this.#blcManager.$getRowByIndex( rowInd ).dataset.id;
	}

	// .........................................................................
	#ongsuiTimewindowPxperbeat( ppb ) {
		this.#blcManager.$setPxPerBeat( ppb );
	}
	#ongsuiTimewindowLineheight( px ) {
		this.#blcManager.$setFontSize( px );
		this.$this.$query( ".gsui-row" ).$setAttr( "data-small", px <= 44 );
	}

	// .........................................................................
	#rowMousedown( e ) {
		this.#blcManager.$onmousedown( e );
		if ( e.button === 0 && !e.shiftKey && this.#blcManager.$getSelectedBlocks().size ) {
			this.#onchange( "unselection" );
		}
	}
	#blcMousedown( id, e ) {
		e.stopPropagation();
		this.#blcManager.$onmousedown( e );
	}
}

GSUdomDefine( "gsui-patternroll", gsuiPatternroll );
