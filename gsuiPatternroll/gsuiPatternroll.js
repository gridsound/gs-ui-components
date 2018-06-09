"use strict";

class gsuiPatternroll extends gsuiBlocksManager {
	constructor() {
		const root = gsuiPatternroll.template.cloneNode( true );

		super( root );
		this.uiBlc.offset = ( el, offset ) => {
		};
		this.uiBlc.row = ( el, rowIncr ) => {
			const trackId = this.data.blocks[ el.dataset.id ].track;

			this.uiBlc.track( el, this._incrTrackId( trackId, rowIncr ) );
		};
		this.uiBlc.track = ( el, trackId ) => {
			const row = this._getRowByTrackId( trackId );

			row && row.firstChild.append( el );
		};

		this._uiTracklist = new gsuiTracklist();
		this._uiTracklist.onchange = tracks => this.onchange( { tracks } );
		this._uiTracklist.ontrackadded = uiTrk => {
			const row = uiTrk.rowElement;

			row.firstChild.style.fontSize = this.__pxPerBeat + "px";
			this._rowsByTrackId.set( row.dataset.track, row );
			this.__rowsContainer.append( row );
		};

		this.data = this._proxyCreate();
		this._idMax = 0;
		this._rowsByTrackId = new Map();
		this.__sideContent.append( this._uiTracklist.rootElement );
		this.__rowsContainer.ondrop = this._drop.bind( this );
		this.__rowsContainer.onmousedown = this.__mousedown.bind( this );
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

	// Blocks manager callback
	// ........................................................................
	blcsManagerCallback( status, blcsMap, valA, valB ) {
		const obj = {},
			data = this.data.blocks;

		switch ( status ) {
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
					obj[ id ] = null;
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
	_onkeydown( e ) { this.__keydown( e ); }
	_mousemove( e ) { this.__mousemove( e ); }
	_mouseup( e ) { this.__mouseup( e ); }
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
		this.uiBlc.when( blc, obj.when );
		this.uiBlc.track( blc, obj.track );
		this.uiBlc.offset( blc, obj.offset );
		this.uiBlc.duration( blc, obj.duration );
		this.uiBlc.selected( blc, obj.selected );
		this.onaddBlock( id, obj, blc );
	}
	_setBlockProp( id, prop, val ) {
		const uiFn = this.uiBlc[ prop ];

		if ( uiFn ) {
			const blc = this.__blcs.get( id );

			uiFn( blc, val );
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
