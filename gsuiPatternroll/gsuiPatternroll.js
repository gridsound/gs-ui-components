"use strict";

class gsuiPatternroll {
	constructor( cb ) {
		const root = gsuiPatternroll.template.cloneNode( true ),
			blcManager = new gsuiBlocksManager( root, {
				blockDOMChange: this._blockDOMChange.bind( this ),
				managercallMoving: ( blcsMap, wIncr, trIncr ) => this.onchange( "move", Array.from( blcsMap.keys() ), wIncr, trIncr ),
				managercallDeleting: blcsMap => this.onchange( "deletion", Array.from( blcsMap.keys() ) ),
				managercallSelecting: blcsMap => this.onchange( "selection", Array.from( blcsMap.keys() ) ),
				managercallUnselecting: () => this.onchange( "unselection" ),
				managercallUnselectingOne: blcId => this.onchange( "unselectionOne", blcId ),
				managercallDuplicating: ( blcsMap, wIncr ) => this.onchange( "duplicate", wIncr ),
				managercallCroppingA: ( blcsMap, wIncr ) => this.onchange( "cropStart", Array.from( blcsMap.keys() ), wIncr ),
				managercallCroppingB: ( blcsMap, wIncr ) => this.onchange( "cropEnd", Array.from( blcsMap.keys() ), wIncr ),
				...cb,
			} );

		this.rootElement = root;
		this.timeline = blcManager.timeline;
		this._tracklist = new gsuiTracklist();
		this.onchange = cb.onchange;
		this.onaddBlock = cb.onaddBlock;
		this.oneditBlock = cb.oneditBlock;
		this._blcManager = blcManager;
		this._rowsByTrackId = new Map();
		Object.seal( this );

		blcManager.__sideContent.append( this._tracklist.rootElement );
		blcManager.__rowsContainer.ondrop = this._drop.bind( this );
		this.setPxPerBeat( 64 );
	}

	// ........................................................................
	addTrack( id ) {
		const elTrack = this._tracklist.addTrack( id ),
			row = elTrack.rowElement;

		row.firstElementChild.style.fontSize = `${ this._blcManager.__pxPerBeat }px`;
		row.classList.toggle( "gsui-row-small", this._blcManager.__pxPerBeat <= 44 );
		row.onmousedown = this._rowMousedown.bind( this );
		this._rowsByTrackId.set( row.dataset.id, row );
		this._blcManager.__rowsWrapinContainer.append( row );
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
	resized() {
		this._blcManager.__resized();
		this._blcManager.__gridPanelResized();
	}
	attached() {
		this._blcManager.__attached();
	}
	setFontSize( ...args ) { this._blcManager.setFontSize( ...args ); }
	setPxPerBeat( ...args ) { this._blcManager.setPxPerBeat( ...args ); }
	getBlocks() { return this._blcManager.__blcs; }
	loop( ...args ) { this._blcManager.loop( ...args ); }
	currentTime( ...args ) { this._blcManager.currentTime( ...args ); }
	timeSignature( ...args ) { this._blcManager.timeSignature( ...args ); }
	getDuration() { return this._blcManager.getDuration(); }

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

	// Private small getters
	// ........................................................................
	_getRowByTrackId( id ) { return this._rowsByTrackId.get( id ); }
	_incrTrackId( id, incr ) {
		const row = this._getRowByTrackId( id ),
			rowInd = this._blcManager.__getRowIndexByRow( row ) + incr;

		return this._blcManager.__getRowByIndex( rowInd ).dataset.id;
	}

	// Mouse and keyboard events
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
