"use strict";

class gsuiDragline {
	onchange = GSUnoop;
	rootElement = GSUgetTemplate( "gsui-dragline" );
	getDropAreas = null;
	#linkedTo = null;
	#dropAreas = null;
	#evKeydown = null;
	#evMouseup = null;
	#evMousemove = null;
	#elements = GSUdomFind( this.rootElement, {
		main: ".gsuiDragline-main",
		svg: ".gsuiDragline-line",
		polyline: ".gsuiDragline-line polyline",
		to: ".gsuiDragline-to",
	} );

	constructor() {
		Object.seal( this );

		this.#elements.to.onmousedown = this.#onmousedownTo.bind( this );
	}

	// .........................................................................
	linkTo( el ) {
		const elem = el || null;

		if ( elem !== this.#linkedTo ) {
			this.#linkedTo = elem;
			GSUdomTogClass( this.rootElement, "gsuiDragline-linked", !!elem );
			elem ? this.redraw() : this.#unlink();
		}
	}
	redraw() {
		if ( this.#linkedTo ) {
			const bcr = $( this.#linkedTo ).$bcr();

			this.#render( bcr.x, bcr.y );
		}
	}

	// .........................................................................
	#render( x, y ) {
		const bcr = $( this.rootElement ).$bcr();
		const w = x - bcr.x;
		const h = y - bcr.y;
		const wabs = Math.abs( w );
		const habs = Math.abs( h );
		const whmax = Math.max( wabs, habs );
		const whmax2 = whmax * 2;

		GSUdomTogClass( this.#elements.main, "gsuiDragline-down", h > 0 );
		GSUdomTogClass( this.#elements.main, "gsuiDragline-right", w > 0 );
		GSUdomStyle( this.#elements.main, {
			top: `${ Math.min( h, 0 ) }px`,
			left: `${ Math.min( w, 0 ) }px`,
			width: `${ wabs }px`,
			height: `${ habs }px`,
		} );
		GSUdomStyle( this.#elements.svg, {
			width: `${ whmax2 }px`,
			height: `${ whmax2 }px`,
			margin: `${ -whmax }px`,
		} );
		GSUdomViewBox( this.#elements.svg, whmax2, whmax2 );
		GSUdomSetAttr( this.#elements.polyline, "points", `${ whmax },${ whmax } ${ whmax + w },${ whmax + h }` );
	}
	#unlink() {
		GSUdomStyle( this.#elements.main, {
			top: 0,
			left: 0,
			width: 0,
			height: 0,
		} );
		GSUdomStyle( this.#elements.svg, {
			width: 0,
			height: 0,
			margin: 0,
		} );
	}
	#cancelDrag() {
		this.#resetDrag();
		if ( this.#linkedTo ) {
			this.redraw();
		} else {
			this.#unlink();
		}
	}
	#resetDrag() {
		GSUdomRmClass( this.rootElement, "gsuiDragline-dragging" );
		this.#dropAreas.forEach( el => {
			GSUdomRmClass( el, "gsuiDragline-dropActive" );
			delete el.onmouseup;
		} );
		document.removeEventListener( "mousemove", this.#evMousemove );
		document.removeEventListener( "mouseup", this.#evMouseup );
		document.removeEventListener( "keydown", this.#evKeydown );
	}

	// .........................................................................
	#onmousedownTo( e ) {
		if ( e.button === 0 ) {
			this.#dropAreas = this.getDropAreas();
			this.#dropAreas.forEach( el => {
				el.onmouseup = this.#onmouseupDrop.bind( this );
				GSUdomAddClass( el, "gsuiDragline-dropActive" );
			} );
			GSUdomAddClass( this.rootElement, "gsuiDragline-dragging" );
			this.#evMousemove = this.#onmousemove.bind( this );
			this.#evMouseup = this.#onmouseup.bind( this );
			this.#evKeydown = this.#onkeydown.bind( this );
			document.addEventListener( "mousemove", this.#evMousemove );
			document.addEventListener( "mouseup", this.#evMouseup );
			document.addEventListener( "keydown", this.#evKeydown );
			this.#onmousemove( e );
		}
	}
	#onkeydown( e ) {
		if ( e.key === "Escape" ) {
			this.#cancelDrag();
		}
	}
	#onmouseupDrop( e ) {
		const tar = e.currentTarget;

		if ( tar !== this.#linkedTo ) {
			this.onchange( tar, this.#linkedTo );
			this.#linkedTo = tar;
		}
		this.#resetDrag();
		this.redraw();
		return false;
	}
	#onmouseup() {
		if ( this.#linkedTo ) {
			this.onchange( null, this.#linkedTo );
			this.#linkedTo = null;
		}
		this.#cancelDrag();
	}
	#onmousemove( e ) {
		this.#render( e.pageX, e.pageY );
	}
}
