"use strict";

class gsuiBlocksEdition {
	constructor( thisParent, callback, elSelection ) {
		this.thisParent = thisParent;
		this.callback = callback;
		this._ = Object.seal( {
			mmFn: null,
			status: "",
			valueA: null,
			valueB: null,
			mdWhen: 0,
			mmWhen: 0,
			mdPageX: 0,
			mdPageY: 0,
			mmPageX: 0,
			mmPageY: 0,
			blcsMap: new Map(),
			beatSnap: 0,
			mdCurrTar: null,
			editionRowMin: 0,
			editionRowMax: 0,
			editionCropMin: 0,
			editionWhenMin: 0,
			selectionRowInd: 0,
			selectionElement: elSelection,
		} );
	}

	getBlocksMap() {
		return this._.blcsMap;
	}

	// Events to call manually:
	mousemove( e ) {
		if ( this._.mmFn ) {
			if ( e.type === "mousemove" ) {
				this._.mmPageX = e.pageX;
				this._.mmPageY = e.pageY;
			}
			this._.mmWhen = this.thisParent.getWhenByPageX( this._.mmPageX );
			this._.mmFn.call( this, e );
		}
	}
	mousedown( e ) {
		const _ = this._,
			thisP = this.thisParent,
			blc = this._getBlc( e.currentTarget );

		if ( e.button === 2 ) {
			_.mmFn = this._deletionMove;
			_.status = "deleting";
			if ( blc ) {
				blc.classList.add( "gsui-block-hidden" );
				_.blcsMap.set( blc.dataset.id, blc );
			}
		} else if ( e.button === 0 ) {
			_.mdPageX = e.pageX;
			_.mdPageY = e.pageY;
			_.mdWhen = thisP.getWhenByPageX( e.pageX );
			if ( e.shiftKey ) {
				_.mmFn = this._selectionStart;
				_.status = "selecting-1";
				_.mdCurrTar = blc;
				_.selectionRowInd = thisP.getRowIndexByPageY( e.pageY );
			} else if ( e.target.classList.contains( "gsui-block-cropB" ) ) {
				const data = thisP.getBlocks();
				let min = Infinity;

				this._fillBlcsMap( blc ).forEach( ( _, id ) => {
					min = Math.min( min, data[ id ].duration );
				} );
				_.mmFn = this._cropBMove;
				_.status = "cropping-b";
				_.beatSnap = thisP.getBeatSnap();
				_.editionCropMin = -Math.max( 0, min - _.beatSnap );
			}
		}
	}
	mouseup() {
		const _ = this._,
			blcsMap = _.blcsMap;

		switch ( _.status ) {
			case "deleting":
				if ( blcsMap.size || this.thisParent.getSelectedBlocksElements().size ) {
					this.callback( "deleting", blcsMap );
				}
				break;
			case "cropping-a":
			case "cropping-b":
				if ( Math.abs( _.valueA ) > .000001 ) {
					this.callback( _.status, blcsMap, _.valueA );
				}
				break;
			case "selecting-2":
				_.selectionElement.classList.add( "gsuiBlocksEdition-selection-hidden" );
			case "selecting-1":
				if ( _.status === "selecting-1" && _.mdCurrTar ) {
					const blc = this._getBlc( _.mdCurrTar );

					if ( blc ) {
						blcsMap.set( blc.dataset.id, blc );
					}
				}
				if ( blcsMap.size ) {
					this.callback( "selecting", blcsMap );
				}
				break;
		}
		_.mmFn =
		_.valueA =
		_.valueB = null;
		_.status = "";
		blcsMap.clear();
	}

	// private:
	_getBlc( el ) {
		if ( el.classList.contains( "gsui-block" ) ) {
			return el;
		} else if ( el.parentNode.classList.contains( "gsui-block" ) ) {
			return el.parentNode;
		}
	}
	_fillBlcsMap( blc ) {
		const blcs = this._.blcsMap;

		if ( blc.classList.contains( "gsui-block-selected" ) ) {
			this.thisParent.getSelectedBlocksElements()
				.forEach( ( blc, id ) => blcs.set( id, blc ) );
		} else {
			blcs.set( blc.dataset.id, blc );
		}
		return blcs;
	}
	_cropBMove( e ) {
		const _ = this._,
			crop = Math.max( _.editionCropMin,
				Math.round( ( _.mmWhen - _.mdWhen ) / _.beatSnap ) * _.beatSnap );

		if ( crop !== _.valueA ) {
			const data = this.thisParent.getBlocks();

			_.valueA = crop;
			_.blcsMap.forEach( ( blc, id ) => (
				blc.style.width = data[ id ].duration + crop + "em"
			) );
		}
	}
	_deletionMove( e ) {
		const _ = this._,
			blc = this._getBlc( e.target );

		if ( blc && !blc.classList.contains( "gsui-block-hidden" ) ) {
			blc.classList.add( "gsui-block-hidden" );
			_.blcsMap.set( blc.dataset.id, blc );
		}
	}
	_selectionStart( e ) {
		const _ = this._;

		if ( Math.abs( _.mmPageX - _.mdPageX ) > 6 ||
			Math.abs( _.mmPageY - _.mdPageY ) > 6
		) {
			_.status = "selecting-2";
			_.mmFn = this._selectionMove;
			_.selectionElement.classList.remove( "gsuiBlocksEdition-selection-hidden" );
			this._selectionMove( e );
		}
	}
	_selectionMove( e ) {
		const _ = this._,
			thisP = this.thisParent,
			rowH = thisP.getRowHeight(),
			pxPB = thisP.getPxPerBeat(),
			st = _.selectionElement.style,
			rowIndB = thisP.getRowIndexByPageY( _.mmPageY ),
			topRow = Math.min( _.selectionRowInd, rowIndB ),
			bottomRow = Math.max( _.selectionRowInd, rowIndB ),
			when = Math.min( _.mdWhen, _.mmWhen ),
			duration = thisP.getBeatSnap() + Math.abs( _.mdWhen - _.mmWhen );

		st.top = topRow * rowH + "px";
		st.left = when * pxPB + "px";
		st.width = duration * pxPB + "px";
		st.height = ( bottomRow - topRow + 1 ) * rowH + "px";
		this._selection( when, duration, topRow, bottomRow );
	}
	_selection( when, duration, rowAInd, rowBInd ) {
		const thisP = this.thisParent,
			elBlcs = thisP.getBlocksElements(),
			elSelectedBlcs = thisP.getSelectedBlocksElements(),
			rowA = thisP.getRowByIndex( rowAInd ),
			rowB = thisP.getRowByIndex( rowBInd ),
			blcs = Object.entries( thisP.getBlocks() )
				.reduce( ( map, [ id, blc ] ) => {
					if ( !elSelectedBlcs.has( id ) &&
						blc.when < when + duration &&
						blc.when + blc.duration > when
					) {
						const elBlc = elBlcs.get( id ),
							pA = rowA.compareDocumentPosition( elBlc ),
							pB = rowB.compareDocumentPosition( elBlc );

						if ( pA & Node.DOCUMENT_POSITION_CONTAINED_BY ||
							pB & Node.DOCUMENT_POSITION_CONTAINED_BY || (
							pA & Node.DOCUMENT_POSITION_FOLLOWING &&
							pB & Node.DOCUMENT_POSITION_PRECEDING )
						) {
							elBlc.classList.add( "gsui-block-selected" );
							map.set( id, elBlc );
						}
					}
					return map;
				}, new Map );

		this._.blcsMap.forEach( ( blc, id ) => blc.classList
			.toggle( "gsui-block-selected", blcs.has( id ) ) );
		this._.blcsMap = blcs;
	}
}
