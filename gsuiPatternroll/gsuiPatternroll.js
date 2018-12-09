"use strict";

class gsuiPatternroll extends gsuiBlocksManager {
	constructor() {
		const root = gsuiPatternroll.template.cloneNode( true );

		super( root );
		this._uiTracklist = new gsuiTracklist();
		this._uiTracklist.onchange = tracks => this.onchange( { tracks } );
		this._uiTracklist.ontrackadded = uiTrk => {
			const row = uiTrk.rowElement;

			row.firstElementChild.style.fontSize = this.__pxPerBeat + "px";
			row.classList.toggle( "gsui-row-small", this.__pxPerBeat <= 44 );
			row.onmousedown = this._rowMousedown.bind( this );
			this._rowsByTrackId.set( row.dataset.track, row );
			this.__rowsWrapinContainer.append( row );
		};

		this.data = this._proxyCreate();
		this._idMax = 0;
		this._rowsByTrackId = new Map();
		this.__sideContent.append( this._uiTracklist.rootElement );
		this.__rowsContainer.ondrop = this._drop.bind( this );
		this.__rowsContainer.onmousedown = this.__mousedown.bind( this );
		this.setPxPerBeat( 64 );
	}

	empty() {
		const blcs = this.data.blocks;

		Object.keys( blcs ).forEach( k => delete blcs[ k ] );
		this._uiTracklist.empty();
	}
	resized() {
		this.__resized();
		this.__gridPanelResized();
	}
	attached() {
		this.__attached();
	}

	// Block's UI functions
	// ........................................................................
	block_offset( el, offset ) {}
	block_row( el, rowIncr ) {
		const trackId = this.data.blocks[ +el.dataset.id ].track;

		this.block_track( el, this._incrTrackId( trackId, rowIncr ) );
	}
	block_track( el, trackId ) {
		const row = this._getRowByTrackId( trackId );

		row && row.firstElementChild.append( el );
	}

	// Blocks manager callback
	// ........................................................................
	blcsManagerCallback( status, blcsMap, valA, valB ) {
		const obj = {},
			data = this.data.blocks;

		switch ( status ) {
			case "duplicating":
				blcsMap.forEach( ( blc, id ) => {
					const d = data[ id ],
						nId = ++this._idMax,
						copy = Object.assign( {}, d );

					copy.when += valA;
					obj[ id ] = { selected: false };
					obj[ nId ] =
					data[ nId ] = copy;
					d.selected = false;
				} );
				break;
			case "selecting":
				blcsMap.forEach( ( _, id ) => {
					const d = data[ id ],
						selected = !d.selected;

					obj[ id ] = { selected };
					d.selected = selected;
				} );
				break;
			case "moving":
				valA = Math.abs( valA ) > .000001 ? valA : 0;
				blcsMap.forEach( ( _, id ) => {
					const d = data[ id ],
						o = {};

					obj[ id ] = o;
					if ( valA ) {
						o.when =
						d.when += valA;
					}
					if ( valB ) {
						o.track =
						d.track = this._incrTrackId( d.track, valB );
					}
				} );
				break;
			case "cropping-a":
				blcsMap.forEach( ( _, id ) => {
					const d = data[ id ],
						when = d.when + valA,
						offset = d.offset + valA,
						duration = d.duration - valA;

					obj[ id ] = { when, offset, duration, durationEdited: true };
					d.when = when;
					d.offset = offset;
					d.duration = duration;
				} );
				break;
			case "cropping-b":
				blcsMap.forEach( ( _, id ) => {
					const d = data[ id ],
						duration = d.duration + valA;

					obj[ id ] = { duration, durationEdited: true };
					d.duration = duration;
				} );
				break;
			case "deleting":
				blcsMap.forEach( ( _, id ) => {
					obj[ id ] = undefined;
					delete data[ id ];
				} );
				this.__unselectBlocks( obj );
				break;
		}
		this.onchange( { blocks: obj } );
	}

	// Private small getters
	// ........................................................................
	_getData() { return this.data.blocks; }
	_getRowByTrackId( id ) { return this._rowsByTrackId.get( id ); }
	_incrTrackId( id, incr ) {
		const row = this._getRowByTrackId( id ),
			rowInd = this.__getRowIndexByRow( row ) + incr;

		return this.__getRowByIndex( rowInd ).dataset.track;
	}

	// Mouse and keyboard events
	// ........................................................................
	_keyup( e ) { this.__keyup( e ); }
	_keydown( e ) { this.__keydown( e ); }
	_mousemove( e ) { this.__mousemove( e ); }
	_mouseup( e ) { this.__mouseup( e ); }
	_rowMousedown() {
		if ( this.__blcsSelected.size ) {
			this.onchange( { blocks: this.__unselectBlocks( {} ) } );
		}
	}
	_blcMousedown( id, e ) {
		e.stopPropagation();
		this.__mousedown( e );
	}
	_drop( e ) {
		const [ pattern, dur ] = e.dataTransfer.getData( "text" ).split( ":" ),
			id = this._idMax + 1,
			obj = {
				pattern,
				duration: +dur,
				durationEdited: false,
				selected: false,
				offset: 0,
				when: this.__getWhenByPageX( e.pageX ),
				track: this.__getRowByIndex( this.__getRowIndexByPageY( e.pageY ) ).dataset.track,
			};

		this.data.blocks[ id ] = obj;
		this.onchange( { blocks: { [ id ]: obj } } );
	}

	// Block's functions
	// ........................................................................
	_deleteBlock( id ) {
		this.__blcs.get( id ).remove();
		this.__blcs.delete( id );
		this.__blcsSelected.delete( id );
		this.onremoveBlock( id );
	}
	_setBlock( id, obj ) {
		const blc = gsuiPatternroll.blockTemplate.cloneNode( true );

		blc.dataset.id = id;
		blc.dataset.pattern = obj.pattern;
		blc.onmousedown = this._blcMousedown.bind( this, id );
		obj.selected
			? this.__blcsSelected.set( id, blc )
			: this.__blcsSelected.delete( id );
		this.__blcs.set( id, blc );
		this.block_when( blc, obj.when );
		this.block_track( blc, obj.track );
		this.block_offset( blc, obj.offset );
		this.block_duration( blc, obj.duration );
		this.block_selected( blc, obj.selected );
		this.onaddBlock( id, obj, blc );
	}
	_setBlockProp( id, prop, val ) {
		const uiFn = this[ "block_" + prop ];

		if ( uiFn ) {
			const blc = this.__blcs.get( id );

			uiFn.call( this, blc, val );
			if ( prop === "selected" ) {
				val
					? this.__blcsSelected.set( id, blc )
					: this.__blcsSelected.delete( id );
			} else if ( prop === "duration" || prop === "offset" ) {
				this.oneditBlock( id, this.data.blocks[ id ], blc );
			}
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
		id = +id;
		if ( id in tar ) {
			this._deleteBlock( id );
			delete tar[ id ];
		} else {
			console.warn( `gsuiPatternroll: proxy useless deletion of block [${ id }]` );
		}
		return true;
	}
	_proxySetBlocks( tar, id, obj ) {
		id = +id;
		if ( id in tar || !obj ) {
			this._proxyDeleteBlocks( tar, id );
			if ( obj ) {
				console.warn( `gsuiPatternroll: reassignation of block [${ id }]` );
			}
		}
		if ( obj ) {
			const prox = new Proxy( Object.seal( Object.assign( {
					when: 0,
					track: null,
					offset: 0,
					pattern: null,
					selected: false,
					duration: 1,
					durationEdited: false,
				}, obj ) ), {
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
