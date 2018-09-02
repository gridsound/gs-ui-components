"use strict";

class gsuiDragline {
	constructor() {
		const root = gsuiDragline.template.cloneNode( true );

		this.onchange = () => {};
		this.rootElement = root;
		this._linkedTo = null;
		this._main = root.firstChild;
		this._to = root.firstChild.lastChild;
		this._to.onmousedown = this._mousedownTo.bind( this );
	}

	remove() {
		delete this._attached;
		this.rootElement.remove();
	}
	attached() {
		this._attached = true;
	}
	linkTo( el ) {
		el = el || null;
		if ( el !== this._linkedTo ) {
			this._linkedTo = el;
			el ? this.redraw() : this._unlink();
		}
	}
	redraw() {
		if ( this._linkedTo ) {
			const bcr = this._linkedTo.getBoundingClientRect();

			this._render( bcr.left, bcr.top );
		}
	}

	// private:
	_render( x, y ) {
		const main = this._main,
			rootBCR = this.rootElement.getBoundingClientRect(),
			w = x - rootBCR.left,
			h = y - rootBCR.top;

		main.classList.toggle( "gsuiDragline-down", h > 0 );
		main.classList.toggle( "gsuiDragline-right", w > 0 );
		main.style.top = Math.min( h, 0 ) + "px";
		main.style.left = Math.min( w, 0 ) + "px";
		main.style.width = Math.abs( w ) + "px";
		main.style.height = Math.abs( h ) + "px";
	}
	_unlink() {
		const st = this._main.style;

		st.top =
		st.left =
		st.width =
		st.height = "0px";
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
		delete this._dragging;
		delete gsuiDragline._focused;
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
			gsuiDragline._focused = this;
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
	_mouseup( e ) {
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

gsuiDragline.template = document.querySelector( "#gsuiDragline-template" );
gsuiDragline.template.remove();
gsuiDragline.template.removeAttribute( "id" );

document.addEventListener( "mousemove", e => {
	gsuiDragline._focused && gsuiDragline._focused._mousemove( e );
} );
document.addEventListener( "mouseup", e => {
	gsuiDragline._focused && gsuiDragline._focused._mouseup( e );
} );
document.addEventListener( "keydown", e => {
	gsuiDragline._focused && gsuiDragline._focused._keydown( e );
} );
