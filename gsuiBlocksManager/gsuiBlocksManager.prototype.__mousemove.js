"use strict";

gsuiBlocksManager.prototype.__mousemove = function( e ) {
	if ( this.__mmFn ) {
		if ( e.type === "mousemove" ) {
			this.__mmPageX = e.pageX;
			this.__mmPageY = e.pageY;
		}
		this.__mmWhenReal = this.__getWhenByPageX( this.__mmPageX );
		this.__mmWhen = this.__roundBeat( this.__mmWhenReal );
		this.__mmFn( e );
	}
};

gsuiBlocksManager.__mousemoveFns = new Map( [
	[ "crop", function() {
		const croppingB = this.__status === "cropping-b",
			cropBrut = this.__beatSnap * Math.round( ( this.__mmWhen - this.__mdWhen ) / this.__beatSnap ),
			crop = Math.max( this.__valueAMin, Math.min( cropBrut, this.__valueAMax ) );

		if ( crop !== this.__valueA ) {
			const data = this._opts.getData();

			this.__valueA = crop;
			this.__blcsEditing.forEach( ( blc, id ) => {
				const blcObj = { ...data[ id ] };

				if ( croppingB ) {
					blcObj.duration += crop;
				} else {
					blcObj.when += crop;
					blcObj.offset += crop;
					blcObj.duration -= crop;
					this._blockDOMChange( blc, "when", blcObj.when );
				}
				this._blockDOMChange( blc, "duration", blcObj.duration );
				this._opts.oneditBlock( id, blcObj, blc );
			} );
		}
	} ],
	[ "move", function() {
		const data = this._opts.getData(),
			when = Math.max( this.__valueAMin,
				Math.round( ( this.__mmWhen - this.__mdWhen ) / this.__beatSnap ) * this.__beatSnap ),
			rows = Math.max( this.__valueBMin, Math.min( this.__valueBMax,
				this.__getRowIndexByPageY( this.__mmPageY ) - this.__mdRowInd ) );

		if ( when !== this.__valueA ) {
			this.__valueA = when;
			this.__blcsEditing.forEach( ( blc, id ) => this._blockDOMChange( blc, "when", data[ id ].when + when ) );
		}
		if ( rows !== this.__valueB ) {
			this.__valueB = rows;
			this.__blcsEditing.forEach( blc => this._blockDOMChange( blc, "row", rows ) );
		}
	} ],
	[ "attack", function() {
		const valBrut = this.__mmWhenReal - this.__mdWhenReal,
			val = Math.max( this.__valueAMin, Math.min( valBrut, this.__valueAMax ) );

		if ( val !== this.__valueA ) {
			const data = this._opts.getData();

			this.__valueA = val;
			this.__blcsEditing.forEach( ( blc, id ) => {
				const blcObj = { ...data[ id ] };

				blcObj.attack += val;
				this._blockDOMChange( blc, "attack", blcObj.attack );
				this._opts.oneditBlock( id, blcObj, blc );
			} );
		}
	} ],
	[ "release", function() {
		const valBrut = this.__mdWhenReal - this.__mmWhenReal,
			val = Math.max( this.__valueAMin, Math.min( valBrut, this.__valueAMax ) );

		if ( val !== this.__valueA ) {
			const data = this._opts.getData();

			this.__valueA = val;
			this.__blcsEditing.forEach( ( blc, id ) => {
				const blcObj = { ...data[ id ] };

				blcObj.release += val;
				this._blockDOMChange( blc, "release", blcObj.release );
				this._opts.oneditBlock( id, blcObj, blc );
			} );
		}
	} ],
	[ "deletion", function( e ) {
		const blc = this.__getBlc( e.target );

		if ( blc && !this.__blcsEditing.has( blc.dataset.id ) ) {
			this._blockDOMChange( blc, "deleted", true );
			this.__blcsEditing.set( blc.dataset.id, blc );
		}
	} ],
	[ "selection1", function() {
		if ( Math.abs( this.__mmPageX - this.__mdPageX ) > 6 ||
			Math.abs( this.__mmPageY - this.__mdPageY ) > 6
		) {
			this.__status = "selecting-2";
			this.__selection.classList.remove( "gsuiBlocksManager-selection-hidden" );
			this.__mmFn = gsuiBlocksManager.__mousemoveFns.get( "selection2" );
			this.__mmFn();
		}
	} ],
	[ "selection2", function() {
		const rowH = this.__fontSize,
			st = this.__selection.style,
			rowIndB = this.__getRowIndexByPageY( this.__mmPageY ),
			when = Math.min( this.__mdWhen, this.__mmWhen ),
			duration = this.__getBeatSnap() + Math.abs( this.__mdWhen - this.__mmWhen ),
			topRow = Math.min( this.__mdRowInd, rowIndB ),
			bottomRow = Math.max( this.__mdRowInd, rowIndB ),
			rowA = this.__getRowByIndex( topRow ),
			rowB = this.__getRowByIndex( bottomRow ),
			blcs = Object.entries( this._opts.getData() )
				.reduce( ( map, [ id, blc ] ) => {
					if ( !this.__blcsSelected.has( id ) &&
						blc.when < when + duration &&
						blc.when + blc.duration > when
					) {
						const elBlc = this.__blcs.get( id ),
							pA = rowA.compareDocumentPosition( elBlc ),
							pB = rowB.compareDocumentPosition( elBlc );

						if ( pA & Node.DOCUMENT_POSITION_CONTAINED_BY ||
							pB & Node.DOCUMENT_POSITION_CONTAINED_BY || (
							pA & Node.DOCUMENT_POSITION_FOLLOWING &&
							pB & Node.DOCUMENT_POSITION_PRECEDING )
						) {
							this._blockDOMChange( elBlc, "selected", true );
							map.set( id, elBlc );
						}
					}
					return map;
				}, new Map() );

		st.top = `${ topRow * rowH }px`;
		st.left = `${ when * this.__pxPerBeat }px`;
		st.width = `${ duration * this.__pxPerBeat }px`;
		st.height = `${ ( bottomRow - topRow + 1 ) * rowH }px`;
		this.__blcsEditing.forEach( ( blc, id ) => this._blockDOMChange( blc, "selected", blcs.has( id ) ) );
		this.__blcsEditing = blcs;
	} ],
] );
