"use strict";

class gsuiBlocksEdition {
	constructor( thisParent, elSelection ) {
		this.thisParent = thisParent;
		this._ = Object.seal( {
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
	mousedown( e ) {
		const _ = this._;

		if ( e.button === 2 ) {
			const tar = e.target;

			_.deletionStatus = true;
			if ( tar.classList.contains( "gsui-block" ) ) {
				tar.classList.add( "gsui-block-hidden" );
				_.deletion.set( tar.dataset.id, tar );
			}
		} else if ( e.button === 0 && e.shiftKey ) {
			_.selectionStatus = 1;
			_.mdPageX = e.pageX;
			_.mdPageY = e.pageY;
			_.selectionWhen = this.thisParent.getWhenByPageX( e.pageX );
			_.selectionRowInd = this.thisParent.getRowIndexByPageY( e.pageY );
		}
	}
	mousemove( e ) {
		const _ = this._;

		if ( _.selectionStatus > 0 ) {
			if ( e.type === "mousemove" ) {
				_.mmPageX = e.pageX;
				_.mmPageY = e.pageY;
			}
			_.selectionStatus === 1
				? this._selectionStart()
				: this._selectionMove();
		} else if ( _.deletionStatus ) {
			const tar = e.target;

			if ( tar.classList.contains( "gsui-block" ) &&
				!tar.classList.contains( "gsui-block-hidden" )
			) {
				tar.classList.add( "gsui-block-hidden" );
				_.deletion.set( tar.dataset.id, tar );
			}
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
	}

	// private:
	_selectionStart() {
		const _ = this._;

		if ( Math.abs( _.mmPageX - _.mdPageX ) > 6 ||
			Math.abs( _.mmPageY - _.mdPageY ) > 6
		) {
			_.selectionStatus = 2;
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
