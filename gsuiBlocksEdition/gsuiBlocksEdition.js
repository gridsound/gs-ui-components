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
			valueAMin: Infinity,
			valueBMin: Infinity,
			valueBMax: -Infinity,
			mdWhen: 0,
			mmWhen: 0,
			mdPageX: 0,
			mdPageY: 0,
			mmPageX: 0,
			mmPageY: 0,
			mdRowInd: 0,
			mdCurrTar: null,
			beatSnap: 0,
			blcsMap: new Map(),
			selectionElement: elSelection,
		} );
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
				thisP.blcDeleted( blc, true );
				_.blcsMap.set( blc.dataset.id, blc );
			}
		} else if ( e.button === 0 ) {
			_.mdPageX = e.pageX;
			_.mdPageY = e.pageY;
			_.mdWhen = thisP.getWhenByPageX( e.pageX );
			_.beatSnap = thisP.getBeatSnap();
			if ( e.shiftKey ) {
				_.mmFn = this._selectionStart;
				_.status = "selecting-1";
				_.mdCurrTar = blc;
				_.mdRowInd = thisP.getRowIndexByPageY( e.pageY );
			} else if ( blc ) {
				const data = thisP.getBlocks(),
					blcsMap = this._fillBlcsMap( blc );

				if ( e.target.classList.contains( "gsui-block-crop" ) ) {
					_.mmFn = this._cropMove;
					_.valueAMin = Infinity;
					blcsMap.forEach( ( blc, id ) => {
						_.valueAMin = Math.min( _.valueAMin, data[ id ].duration );
					} );
					_.valueAMin = -Math.max( 0, _.valueAMin - _.beatSnap );
					_.status = e.target.classList.contains( "gsui-block-cropA" )
						? "cropping-a"
						: "cropping-b";
				} else {
					_.mmFn = this._moveMove;
					_.status = "moving";
					_.mdRowInd = thisP.getRowIndexByPageY( e.pageY );
					blcsMap.forEach( ( blc, id ) => {
						const valB = thisP.getRowIndexByRow( blc.parentNode.parentNode );

						_.valueAMin = Math.min( _.valueAMin, data[ id ].when );
						_.valueBMin = Math.min( _.valueBMin, valB );
						_.valueBMax = Math.max( _.valueBMax, valB );
					} );
					_.valueAMin *= -1;
					_.valueBMin *= -1;
					_.valueBMax = thisP.getNbRows() - 1 - _.valueBMax;
				}
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
			case "moving":
				if ( Math.abs( _.valueA ) > .000001 || _.valueB ) {
					this.callback( "moving", blcsMap, _.valueA, _.valueB );
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
		_.valueAMin =
		_.valueBMin = Infinity;
		_.valueBMax = -Infinity;
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
	_cropMove() {
		const _ = this._,
			crop = Math.max( _.valueAMin,
				Math.round( ( _.mmWhen - _.mdWhen ) / _.beatSnap ) * _.beatSnap );

		if ( crop !== _.valueA ) {
			const thisP = this.thisParent,
				data = thisP.getBlocks();

			_.valueA = crop;
			_.blcsMap.forEach( _.status === "cropping-a"
				? ( blc, id ) => {
					thisP.blcOffset( blc, data[ id ].offset - crop );
					thisP.blcDuration( blc, data[ id ].duration + crop );
				}
				: ( blc, id ) => {
					thisP.blcDuration( blc, data[ id ].duration + crop );
				} );
		}
	}
	_moveMove() {
		const _ = this._,
			thisP = this.thisParent,
			data = thisP.getBlocks(),
			when = Math.max( _.valueAMin,
				Math.round( ( _.mmWhen - _.mdWhen ) / _.beatSnap ) * _.beatSnap ),
			rows = Math.max( _.valueBMin, Math.min( _.valueBMax,
				thisP.getRowIndexByPageY( _.mmPageY ) - _.mdRowInd ) );

		if ( when !== _.valueA ) {
			_.valueA = when;
			_.blcsMap.forEach( ( blc, id ) => thisP.blcWhen( blc, data[ id ].when + when ) );
		}
		if ( rows !== _.valueB ) {
			const nlRows = thisP.getRows();

			_.valueB = rows;
			_.blcsMap.forEach( ( blc, id ) => thisP.blcRow( blc, rows ) );
		}
	}
	_deletionMove( e ) {
		const blc = this._getBlc( e.target );

		if ( blc && !this._.blcsMap.has( blc.dataset.id ) ) {
			this.thisParent.blcDeleted( blc, true );
			this._.blcsMap.set( blc.dataset.id, blc );
		}
	}
	_selectionStart() {
		const _ = this._;

		if ( Math.abs( _.mmPageX - _.mdPageX ) > 6 ||
			Math.abs( _.mmPageY - _.mdPageY ) > 6
		) {
			_.status = "selecting-2";
			_.mmFn = this._selectionMove;
			_.selectionElement.classList.remove( "gsuiBlocksEdition-selection-hidden" );
			this._selectionMove();
		}
	}
	_selectionMove() {
		const _ = this._,
			thisP = this.thisParent,
			rowH = thisP.getRowHeight(),
			pxPB = thisP.getPxPerBeat(),
			st = _.selectionElement.style,
			rowIndB = thisP.getRowIndexByPageY( _.mmPageY ),
			topRow = Math.min( _.mdRowInd, rowIndB ),
			bottomRow = Math.max( _.mdRowInd, rowIndB ),
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
							thisP.blcSelected( elBlc, true );
							map.set( id, elBlc );
						}
					}
					return map;
				}, new Map );

		this._.blcsMap.forEach( ( blc, id ) => thisP.blcSelected( blc, blcs.has( id ) ) );
		this._.blcsMap = blcs;
	}
}
