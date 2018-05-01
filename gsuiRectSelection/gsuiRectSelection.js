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
		} );
	}

	// Events to call manually:
	mousedown( e ) {
		const _ = this._;

		_.status = 1;
		_.pageX = e.pageX;
		_.pageY = e.pageY;
		_.when = this.thisParent._getWhenFromPageX( e.pageX );
		_.rowInd = this.thisParent._getRowIndFromPageY( e.pageY );
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
		_.el.classList.add( "gsuiRectSelection-hidden" );
	}

	// private:
	_start( e ) {
		const _ = this._;

		if ( Math.abs( e.pageX - _.pageX ) > 6 ||
			Math.abs( e.pageY - _.pageY ) > 6
		) {
			const bcr = this.thisParent._getRowsBCR();

			_.status = 2;
			_.el.classList.remove( "gsuiRectSelection-hidden" );
			this._move( e );
		}
	}
	_move( e ) {
		const _ = this._,
			thisP = this.thisParent,
			thisP_ = thisP._,
			st = _.el.style,
			rowIndB = thisP._getRowIndFromPageY( e.pageY ),
			whenB = thisP._getWhenFromPageX( e.pageX ),
			topRow = Math.min( _.rowInd, rowIndB ),
			heightRow = 1 + Math.abs( _.rowInd - rowIndB ),
			when = Math.min( _.when, whenB ),
			duration = 1 / thisP_.uiTimeline._stepsPerBeat + Math.abs( _.when - whenB );

		st.top = topRow * thisP_.fontSize + "px";
		st.left = when * thisP_.pxPerBeat + "px";
		st.width = duration * thisP_.pxPerBeat + "px";
		st.height = heightRow * thisP_.fontSize + "px";
	}
}
