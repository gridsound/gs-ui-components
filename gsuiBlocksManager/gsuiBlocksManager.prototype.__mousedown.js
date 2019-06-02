"use strict";

gsuiBlocksManager.prototype.__mousedown = function( e ) {
	if ( !gsuiBlocksManager._focused ) {
		const blc = this.__getBlc( e.currentTarget );

		gsuiBlocksManager._focused = this;
		window.getSelection().removeAllRanges();
		this.__mdBlc = blc;
		if ( e.button === 2 ) {
			this.__mmFn = gsuiBlocksManager.__mousemoveFns.get( "deletion" );
			this.__status = "deleting";
			if ( blc ) {
				this.block_deleted( blc, true );
				this.__blcsEditing.set( blc.dataset.id, blc );
			}
		} else if ( e.button === 0 ) {
			this.__mdPageX = e.pageX;
			this.__mdPageY = e.pageY;
			this.__mdWhen = this.__getWhenByPageX( e.pageX );
			this.__beatSnap = this.__getBeatSnap();
			if ( e.shiftKey ) {
				this.__mmFn = gsuiBlocksManager.__mousemoveFns.get( "selection1" );
				this.__status = "selecting-1";
				this.__mdRowInd = this.__getRowIndexByPageY( e.pageY );
			} else if ( blc ) {
				const fnAct = gsuiBlocksManager.__mousedownFns.get( e.target.dataset.action );

				if ( fnAct ) {
					const data = this._getData(),
						blcsEditing = this.__fillBlcsMap( blc );

					this.__mdTarget = e.target;
					blc.classList.add( "gsui-hover" );
					e.target.classList.add( "gsui-hover" );
					fnAct.call( this, data, blcsEditing, blc, e );
				}
			}
		}
	}
};

gsuiBlocksManager.__mousedownFns = new Map( [
	[ "move", function( data, blcsEditing, blc, e ) {
		this.__mmFn = gsuiBlocksManager.__mousemoveFns.get( "move" );
		this.__status = "moving";
		this.__mdRowInd = this.__getRowIndexByPageY( e.pageY );
		blcsEditing.forEach( ( blc, id ) => {
			const valB = this.__getRowIndexByRow( blc.parentNode.parentNode );

			this.__valueAMin = Math.min( this.__valueAMin, data[ id ].when );
			this.__valueBMin = Math.min( this.__valueBMin, valB );
			this.__valueBMax = Math.max( this.__valueBMax, valB );
		} );
		this.__valueAMin *= -1;
		this.__valueBMin *= -1;
		this.__valueBMax = this.__rows.length - 1 - this.__valueBMax;
	} ],
	[ "cropA", function( data, blcsEditing, blc, e ) {
		this.__mmFn = gsuiBlocksManager.__mousemoveFns.get( "crop" );
		this.__status = "cropping-a";
		this.__valueAMin =
		this.__valueAMax = Infinity;
		blcsEditing.forEach( ( blc, id ) => {
			const dat = data[ id ];

			this.__valueAMin = Math.min( this.__valueAMin, dat.offset );
			this.__valueAMax = Math.min( this.__valueAMax, dat.duration );
		} );
		this.__valueAMin *= -1;
		this.__valueAMax = Math.max( 0, this.__valueAMax - this.__beatSnap );
	} ],
	[ "cropB", function( data, blcsEditing, blc, e ) {
		this.__mmFn = gsuiBlocksManager.__mousemoveFns.get( "crop" );
		this.__status = "cropping-b";
		this.__valueAMin =
		this.__valueAMax = Infinity;
		blcsEditing.forEach( ( blc, id ) => {
			this.__valueAMin = Math.min( this.__valueAMin, data[ id ].duration );
		} );
		this.__valueAMin = -Math.max( 0, this.__valueAMin - this.__beatSnap );
	} ],
] );
