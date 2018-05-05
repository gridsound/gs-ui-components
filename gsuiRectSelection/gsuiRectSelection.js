"use strict";

class gsuiRectSelection {
	constructor( thisParent, elSelection ) {
		this.thisParent = thisParent;
		this._ = Object.seal( {
			el: elSelection,
			status: 0,
			pageX: 0,
			pageY: 0,
			when: 0,
			rowInd: 0,
			selection: {},
		} );
	}

	getSelectedBlocks() {
		return this._.selection;
	}

	// Events to call manually:
	mousedown( e ) {
		const _ = this._;

		_.status = 1;
		_.pageX = e.pageX;
		_.pageY = e.pageY;
		_.when = this.thisParent.getWhenByPageX( e.pageX );
		_.rowInd = this.thisParent.getRowIndexByPageY( e.pageY );
	}
	mousemove( e ) {
		const st = this._.status;

		if ( st === 1 ) {
			this._start( e );
		} else if ( st === 2 ) {
			this._move( e );
		}
	}
	mouseup() {
		const _ = this._;

		_.status = 0;
		_.selection = {};
		_.el.classList.add( "gsuiRectSelection-hidden" );
	}

	// private:
	_start( e ) {
		const _ = this._;

		if ( Math.abs( e.pageX - _.pageX ) > 6 ||
			Math.abs( e.pageY - _.pageY ) > 6
		) {
			_.status = 2;
			_.el.classList.remove( "gsuiRectSelection-hidden" );
			this._move( e );
		}
	}
	_move( e ) {
		const _ = this._,
			thisP = this.thisParent,
			rowH = thisP.getRowHeight(),
			pxPB = thisP.getPxPerBeat(),
			st = _.el.style,
			rowIndB = thisP.getRowIndexByPageY( e.pageY ),
			whenB = thisP.getWhenByPageX( e.pageX ),
			topRow = Math.min( _.rowInd, rowIndB ),
			bottomRow = Math.max( _.rowInd, rowIndB ),
			when = Math.min( _.when, whenB ),
			duration = 1 / thisP.getStepsPerBeat() + Math.abs( _.when - whenB );

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
