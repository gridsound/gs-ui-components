"use strict";

class gsuiBlocksEdition {
	constructor( thisParent, elSelection ) {
		this.thisParent = thisParent;
		this._ = Object.seal( {
			mmFn: null,
			mdPageX: 0,
			mdPageY: 0,
			mmPageX: 0,
			mmPageY: 0,
			deletion: new Map(),
			selection: {},
			selectionWhen: 0,
			deletionStatus: false,
			selectionStatus: 0,
			selectionRowInd: 0,
			selectionElement: elSelection,
		} );
	}

	getSelectedBlocks() {
		return this._.selection;
	}
	getDeletingBlocks() {
		return this._.deletion;
	}

	// Events to call manually:
	mousemove( e ) {
		this._.mmFn && this._.mmFn.call( this, e );
	}
	mousedown( e ) {
		const _ = this._;

		if ( e.button === 2 ) {
			const tar = e.target;

			_.deletionStatus = true;
			_.mmFn = this._deletionMove;
			if ( tar.classList.contains( "gsui-block" ) ) {
				tar.classList.add( "gsui-block-hidden" );
				_.deletion.set( tar.dataset.id, tar );
			}
		} else if ( e.button === 0 && e.shiftKey ) {
			_.selectionStatus = 1;
			_.mdPageX = e.pageX;
			_.mdPageY = e.pageY;
			_.mmFn = this._selectionStart;
			_.selectionWhen = this.thisParent.getWhenByPageX( e.pageX );
			_.selectionRowInd = this.thisParent.getRowIndexByPageY( e.pageY );
		}
	}
	mouseup() {
		const _ = this._;

		if ( _.selectionStatus > 0 ) {
			_.selection = {};
			_.selectionStatus = 0;
			_.selectionElement.classList.add( "gsuiBlocksEdition-selection-hidden" );
		} else if ( _.deletionStatus ) {
			_.deletion.clear();
			_.deletionStatus = false;
		}
		_.mmFn = null;
	}

	// private:
	_setMousemoveCoord( e ) {
		if ( e.type === "mousemove" ) {
			this._.mmPageX = e.pageX;
			this._.mmPageY = e.pageY;
		}
	}
	_deletionMove( e ) {
		const _ = this._,
			tar = e.target;

		if ( tar.classList.contains( "gsui-block" ) &&
			!tar.classList.contains( "gsui-block-hidden" )
		) {
			tar.classList.add( "gsui-block-hidden" );
			_.deletion.set( tar.dataset.id, tar );
		}
	}
	_selectionStart( e ) {
		const _ = this._;

		this._setMousemoveCoord( e );
		if ( Math.abs( _.mmPageX - _.mdPageX ) > 6 ||
			Math.abs( _.mmPageY - _.mdPageY ) > 6
		) {
			_.selectionStatus = 2;
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
				.reduce( ( obj, [ id, blc ] ) => {
					if ( !elSelectedBlcs[ id ] &&
						blc.when < when + duration &&
						blc.when + blc.duration > when
					) {
						const elBlc = elBlcs[ id ],
							pA = rowA.compareDocumentPosition( elBlc ),
							pB = rowB.compareDocumentPosition( elBlc );

						if ( pA & Node.DOCUMENT_POSITION_CONTAINED_BY ||
							pB & Node.DOCUMENT_POSITION_CONTAINED_BY || (
							pA & Node.DOCUMENT_POSITION_FOLLOWING &&
							pB & Node.DOCUMENT_POSITION_PRECEDING )
						) {
							elBlc.classList.add( "gsui-block-selected" );
							obj[ id ] = elBlc;
						}
					}
					return obj;
				}, {} );

		Object.values( this._.selection ).forEach( blc => {
			if ( !blcs[ blc.dataset.id ] ) {
				blc.classList.remove( "gsui-block-selected" );
			}
		} );
		this._.selection = blcs;
	}
}
