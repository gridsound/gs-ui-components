"use strict";

class gsuiPatternroll {
	constructor( cb ) {
		const root = gsuiPatternroll.template.cloneNode( true ),
			blcManager = new gsuiBlocksManager( root, {
				getData: () => this.data.blocks,
				blockDOMChange: this._blockDOMChange.bind( this ),
				managercallDuplicating: this.managercallDuplicating.bind( this ),
				managercallSelecting: this.managercallSelecting.bind( this ),
				managercallMoving: this.managercallMoving.bind( this ),
				managercallDeleting: this.managercallDeleting.bind( this ),
				managercallCroppingA: this.managercallCroppingA.bind( this ),
				managercallCroppingB: this.managercallCroppingB.bind( this ),
				...cb,
			} );

		this.rootElement = root;
		this.timeline = blcManager.timeline;
		this.onchange = cb.onchange;
		this.onaddBlock = cb.onaddBlock;
		this.oneditBlock = cb.oneditBlock;
		this._blcManager = blcManager;
		this._uiTracklist = new gsuiTracklist();
		this._uiTracklist.onchange = tracks => this.onchange( { tracks } );
		this._uiTracklist.ontrackadded = uiTrk => {
			const row = uiTrk.rowElement;

			row.firstElementChild.style.fontSize = `${ this._blcManager.__pxPerBeat }px`;
			row.classList.toggle( "gsui-row-small", this._blcManager.__pxPerBeat <= 44 );
			row.onmousedown = this._rowMousedown.bind( this );
			this._rowsByTrackId.set( row.dataset.track, row );
			this._blcManager.__rowsWrapinContainer.append( row );
		};

		this.data = this._proxyCreate();
		this._idMax = 0;
		this._rowsByTrackId = new Map();
		blcManager.__sideContent.append( this._uiTracklist.rootElement );
		blcManager.__rowsContainer.ondrop = this._drop.bind( this );
		this.setPxPerBeat( 64 );
	}

	empty() {
		const blcs = this.data.blocks;

		Object.keys( blcs ).forEach( k => delete blcs[ k ] );
		this._uiTracklist.empty();
	}
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
			case "row": {
				const trackId = this.data.blocks[ el.dataset.id ].track;

				this._blockDOMChange( el, "track", this._incrTrackId( trackId, val ) );
			} break;
			case "track": {
				const row = this._getRowByTrackId( val );

				row && row.firstElementChild.append( el );
			} break;
		}
	}
	managercallDuplicating( blcsMap, valA ) {
		const obj = {},
			data = this.data.blocks;

		blcsMap.forEach( ( _blc, id ) => {
			const d = data[ id ],
				nId = ++this._idMax,
				copy = { ...d };

			copy.when += valA;
			obj[ id ] = { selected: false };
			obj[ nId ] =
			data[ nId ] = copy;
			d.selected = false;
		} );
		this.onchange( { blocks: obj } );
	}
	managercallSelecting( blcsMap ) {
		const obj = {},
			data = this.data.blocks;

		blcsMap.forEach( ( _blc, id ) => {
			const d = data[ id ],
				selected = !d.selected;

			obj[ id ] = { selected };
			d.selected = selected;
		} );
		this.onchange( { blocks: obj } );
	}
	managercallMoving( blcsMap, valA, valB ) {
		const obj = {},
			data = this.data.blocks,
			when = Math.abs( valA ) > .000001 ? valA : 0;

		blcsMap.forEach( ( _blc, id ) => {
			const d = data[ id ],
				o = {};

			obj[ id ] = o;
			if ( when ) {
				o.when =
				d.when += when;
			}
			if ( valB ) {
				o.track =
				d.track = this._incrTrackId( d.track, valB );
			}
		} );
		this.onchange( { blocks: obj } );
	}
	managercallDeleting( blcsMap ) {
		const obj = {},
			data = this.data.blocks;

		blcsMap.forEach( ( _blc, id ) => {
			obj[ id ] = undefined;
			delete data[ id ];
		} );
		this._blcManager.__unselectBlocks( obj );
		this.onchange( { blocks: obj } );
	}
	managercallCroppingA( blcsMap, valA ) {
		const obj = {},
			data = this.data.blocks;

		blcsMap.forEach( ( _blc, id ) => {
			const d = data[ id ],
				when = d.when + valA,
				offset = d.offset + valA,
				duration = d.duration - valA;

			obj[ id ] = { when, offset, duration, durationEdited: true };
			d.when = when;
			d.offset = offset;
			d.duration = duration;
		} );
		this.onchange( { blocks: obj } );
	}
	managercallCroppingB( blcsMap, valA ) {
		const obj = {},
			data = this.data.blocks;

		blcsMap.forEach( ( _blc, id ) => {
			const d = data[ id ],
				duration = d.duration + valA;

			obj[ id ] = { duration, durationEdited: true };
			d.duration = duration;
		} );
		this.onchange( { blocks: obj } );
	}

	// Private small getters
	// ........................................................................
	_getRowByTrackId( id ) { return this._rowsByTrackId.get( id ); }
	_incrTrackId( id, incr ) {
		const row = this._getRowByTrackId( id ),
			rowInd = this._blcManager.__getRowIndexByRow( row ) + incr;

		return this._blcManager.__getRowByIndex( rowInd ).dataset.track;
	}

	// Mouse and keyboard events
	// ........................................................................
	_rowMousedown( e ) {
		this._blcManager.__mousedown( e );
		if ( e.button === 0 && !e.shiftKey && this._blcManager.__blcsSelected.size ) {
			this.onchange( { blocks: this._blcManager.__unselectBlocks( {} ) } );
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
			const id = this._idMax + 1,
				obj = {
					pattern: dropData[ 0 ],
					duration: +dropData[ 1 ],
					durationEdited: false,
					selected: false,
					offset: 0,
					when: this._blcManager.__roundBeat( this._blcManager.__getWhenByPageX( e.pageX ) ),
					track: this._blcManager.__getRowByIndex( this._blcManager.__getRowIndexByPageY( e.pageY ) ).dataset.track,
				};

			this.data.blocks[ id ] = obj;
			this.onchange( { blocks: { [ id ]: obj } } );
		}
	}

	// Block's functions
	// ........................................................................
	_deleteBlock( id ) {
		this._blcManager.__blcs.get( id ).remove();
		this._blcManager.__blcs.delete( id );
		this._blcManager.__blcsSelected.delete( id );
	}
	_setBlock( id, obj ) {
		const blc = gsuiPatternroll.blockTemplate.cloneNode( true );

		blc.dataset.id = id;
		blc.dataset.pattern = obj.pattern;
		blc.onmousedown = this._blcMousedown.bind( this, id );
		obj.selected
			? this._blcManager.__blcsSelected.set( id, blc )
			: this._blcManager.__blcsSelected.delete( id );
		this._blcManager.__blcs.set( id, blc );
		this._blockDOMChange( blc, "when", obj.when );
		this._blockDOMChange( blc, "track", obj.track );
		this._blockDOMChange( blc, "duration", obj.duration );
		this._blockDOMChange( blc, "selected", obj.selected );
		this.onaddBlock( id, obj, blc );
	}
	_setBlockProp( id, prop, val ) {
		const blc = this._blcManager.__blcs.get( id );

		this._blockDOMChange( blc, prop, val );
		if ( prop === "selected" ) {
			val
				? this._blcManager.__blcsSelected.set( id, blc )
				: this._blcManager.__blcsSelected.delete( id );
		} else if ( prop === "duration" || prop === "offset" ) {
			this.oneditBlock( id, this.data.blocks[ id ], blc );
		}
	}

	// Data proxy
	// ........................................................................
	_proxyCreate() {
		return Object.freeze( {
			tracks: this._uiTracklist.data,
			blocks: new Proxy( {}, {
				set: this._proxySetBlocks.bind( this ),
				deleteProperty: this._proxyDeleteBlocks.bind( this )
			} )
		} );
	}
	_proxyDeleteBlocks( tar, id ) {
		if ( id in tar ) {
			this._deleteBlock( id );
			delete tar[ id ];
		} else {
			console.warn( `gsuiPatternroll: proxy useless deletion of block [${ id }]` );
		}
		return true;
	}
	_proxySetBlocks( tar, id, obj ) {
		if ( id in tar || !obj ) {
			this._proxyDeleteBlocks( tar, id );
			if ( obj ) {
				console.warn( `gsuiPatternroll: reassignation of block [${ id }]` );
			}
		}
		if ( obj ) {
			const prox = new Proxy( Object.seal( {
					when: 0,
					track: null,
					offset: 0,
					pattern: null,
					selected: false,
					duration: 1,
					durationEdited: false,
					...obj,
				} ), {
					set: this._proxySetBlockProp.bind( this, id )
				} );

			tar[ id ] = prox;
			this._idMax = Math.max( this._idMax, id );
			this._setBlock( id, prox );
		}
		return true;
	}
	_proxySetBlockProp( id, tar, prop, val ) {
		tar[ prop ] = val;
		this._setBlockProp( id, prop, val );
		return true;
	}
}

gsuiPatternroll.template = document.querySelector( "#gsuiPatternroll-template" );
gsuiPatternroll.template.remove();
gsuiPatternroll.template.removeAttribute( "id" );
gsuiPatternroll.blockTemplate = document.querySelector( "#gsuiPatternroll-block-template" );
gsuiPatternroll.blockTemplate.remove();
gsuiPatternroll.blockTemplate.removeAttribute( "id" );
