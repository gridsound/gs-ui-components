"use strict";

class gsuiBlocksEdition {
	constructor( thisParent, elSelection ) {
		this.thisParent = thisParent;
		this._ = Object.seal( {
			mmFn: null,
			status: "",
			mdPageX: 0,
			mdPageY: 0,
			mmPageX: 0,
			mmPageY: 0,
			mdCurrTar: null,
			blcsMap: new Map(),
			selectionWhen: 0,
			selectionRowInd: 0,
			selectionElement: elSelection,
		} );
	}

	getBlocksMap() {
		return this._.blcsMap;
	}

	// Events to call manually:
	mousemove( e ) {
		this._.mmFn && this._.mmFn.call( this, e );
	}
	mousedown( e ) {
		const _ = this._;

		if ( e.button === 2 ) {
			const blc = this._getBlc( e.currentTarget );

			_.status = "deleting";
			_.mmFn = this._deletionMove;
			if ( blc ) {
				blc.classList.add( "gsui-block-hidden" );
				_.blcsMap.set( blc.dataset.id, blc );
			}
		} else if ( e.button === 0 ) {
			_.mdCurrTar = this._getBlc( e.currentTarget );
			if ( e.shiftKey ) {
				_.status = "selecting-1";
				_.mmFn = this._selectionStart;
				_.mdPageX = e.pageX;
				_.mdPageY = e.pageY;
				// _.mdCurrTar = this._getBlc( e.currentTarget );
				_.selectionWhen = this.thisParent.getWhenByPageX( e.pageX );
				_.selectionRowInd = this.thisParent.getRowIndexByPageY( e.pageY );
			} else if ( e.target.classList.contains( "gsui-block-cropB" ) ) {
				lg("cropB",_.mdCurrTar)
			}
		}
	}
	mouseup() {
		if ( this._.status === "selecting-1" ) {
			const blc = this._getBlc( this._.mdCurrTar );

			if ( blc ) {
				this._.blcsMap.set( blc.dataset.id, blc );
			}
		}
	}
	clear() {
		const _ = this._;

		_.mmFn = null;
		_.status = "";
		_.blcsMap.clear();
		_.selectionElement.classList.add( "gsuiBlocksEdition-selection-hidden" );
	}

	// private:
	_getBlc( el ) {
		if ( el.classList.contains( "gsui-block" ) ) {
			return el;
		} else if ( el.parentNode.classList.contains( "gsui-block" ) ) {
			return el.parentNode;
		}
	}
	_setMousemoveCoord( e ) {
		if ( e.type === "mousemove" ) {
			this._.mmPageX = e.pageX;
			this._.mmPageY = e.pageY;
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

		this._setMousemoveCoord( e );
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
		this._setMousemoveCoord( e );

		const _ = this._,
			thisP = this.thisParent,
			rowH = thisP.getRowHeight(),
			pxPB = thisP.getPxPerBeat(),
			st = _.selectionElement.style,
			rowIndB = thisP.getRowIndexByPageY( _.mmPageY ),
			whenB = thisP.getWhenByPageX( _.mmPageX ),
			topRow = Math.min( _.selectionRowInd, rowIndB ),
			bottomRow = Math.max( _.selectionRowInd, rowIndB ),
			when = Math.min( _.selectionWhen, whenB ),
			duration = 1 / thisP.getStepsPerBeat() + Math.abs( _.selectionWhen - whenB );

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
