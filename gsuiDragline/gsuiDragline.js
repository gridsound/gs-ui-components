"use strict";

class gsuiDragline {
	constructor() {
		const root = GSUI.getTemplate( "gsui-dragline" ),
			svg = root.firstElementChild.firstElementChild;

		this.onchange = () => {};
		this.rootElement = root;
		this.getDropAreas =
		this._linkedTo =
		this._dropAreas =
		this._evKeydown =
		this._evMouseup =
		this._evMousemove = null;
		this._dragging = false;
		this._lineSize = 0;
		this._svg = svg;
		this._to = root.firstElementChild.lastElementChild;
		this._main = root.firstElementChild;
		this._polyline = svg.firstElementChild;
		Object.seal( this );

		this._to.onmousedown = this._mousedownTo.bind( this );
	}

	linkTo( el ) {
		const elem = el || null;

		if ( elem !== this._linkedTo ) {
			this._linkedTo = elem;
			this.rootElement.classList.toggle( "gsuiDragline-linked", !!elem );
			elem ? this.redraw() : this._unlink();
		}
	}
	redraw() {
		if ( this._linkedTo ) {
			const bcr = this._linkedTo.getBoundingClientRect();

			this._updateLineSize();
			this._render( bcr.left, bcr.top );
		}
	}

	// private:
	_updateLineSize() {
		this._lineSize = parseFloat( getComputedStyle( this._polyline ).strokeWidth ) || 0;
	}
	_render( x, y ) {
		const clMain = this._main.classList,
			stMain = this._main.style,
			stSvg = this._svg.style,
			bcr = this.rootElement.getBoundingClientRect(),
			w = x - bcr.left,
			h = y - bcr.top,
			wabs = Math.abs( w ),
			habs = Math.abs( h ),
			whmax = Math.max( wabs, habs ),
			whmax2 = whmax * 2;

		clMain.toggle( "gsuiDragline-down", h > 0 );
		clMain.toggle( "gsuiDragline-right", w > 0 );
		stMain.top = `${ Math.min( h, 0 ) }px`;
		stMain.left = `${ Math.min( w, 0 ) }px`;
		stMain.width = `${ wabs }px`;
		stMain.height = `${ habs }px`;
		stSvg.width =
		stSvg.height = `${ whmax2 }px`;
		stSvg.margin = `${ -whmax }px`;
		this._svg.setAttribute( "viewBox", `0 0 ${ whmax2 } ${ whmax2 }` );
		this._polyline.setAttribute( "points", `${ whmax },${ whmax } ${ whmax + w },${ whmax + h }` );
	}
	_unlink() {
		const stMain = this._main.style,
			stSvg = this._svg.style;

		stMain.top =
		stMain.left =
		stMain.width =
		stMain.height =
		stSvg.width =
		stSvg.height =
		stSvg.margin = "0px";
	}
	_cancelDrag() {
		this._resetDrag();
		if ( this._linkedTo ) {
			this.redraw();
		} else {
			this._unlink();
		}
	}
	_resetDrag() {
		this.rootElement.classList.remove( "gsuiDragline-dragging" );
		this._dropAreas.forEach( el => {
			el.classList.remove( "gsuiDragline-dropActive" );
			delete el.onmouseup;
		} );
		this._dragging = false;
		document.removeEventListener( "mousemove", this._evMousemove );
		document.removeEventListener( "mouseup", this._evMouseup );
		document.removeEventListener( "keydown", this._evKeydown );
	}

	// events:
	_mousedownTo( e ) {
		if ( e.button === 0 ) {
			this._dragging = true;
			this._dropAreas = this.getDropAreas();
			this._dropAreas.forEach( el => {
				el.onmouseup = this._mouseupDrop.bind( this );
				el.classList.add( "gsuiDragline-dropActive" );
			} );
			this.rootElement.classList.add( "gsuiDragline-dragging" );
			this._evMousemove = this._mousemove.bind( this );
			this._evMouseup = this._mouseup.bind( this );
			this._evKeydown = this._keydown.bind( this );
			document.addEventListener( "mousemove", this._evMousemove );
			document.addEventListener( "mouseup", this._evMouseup );
			document.addEventListener( "keydown", this._evKeydown );
			this._updateLineSize();
			this._mousemove( e );
		}
	}
	_keydown( e ) {
		if ( e.key === "Escape" ) {
			this._cancelDrag();
		}
	}
	_mouseupDrop( e ) {
		const tar = e.currentTarget;

		if ( tar !== this._linkedTo ) {
			this.onchange( tar, this._linkedTo );
			this._linkedTo = tar;
		}
		this._resetDrag();
		this.redraw();
		return false;
	}
	_mouseup() {
		if ( this._linkedTo ) {
			this.onchange( null, this._linkedTo );
			this._linkedTo = null;
		}
		this._cancelDrag();
	}
	_mousemove( e ) {
		this._render( e.pageX, e.pageY );
	}
}
