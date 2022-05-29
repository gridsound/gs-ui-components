"use strict";

class gsuiDragline {
	onchange = GSUI.$noop;
	rootElement = GSUI.$getTemplate( "gsui-dragline" );
	getDropAreas = null;
	#linkedTo = null;
	#dropAreas = null;
	#evKeydown = null;
	#evMouseup = null;
	#evMousemove = null;
	#elements = GSUI.$findElements( this.rootElement, {
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
			this.rootElement.classList.toggle( "gsuiDragline-linked", !!elem );
			elem ? this.redraw() : this.#unlink();
		}
	}
	redraw() {
		if ( this.#linkedTo ) {
			const bcr = this.#linkedTo.getBoundingClientRect();

			this.#render( bcr.left, bcr.top );
		}
	}

	// .........................................................................
	#render( x, y ) {
		const clMain = this.#elements.main.classList;
		const stMain = this.#elements.main.style;
		const stSvg = this.#elements.svg.style;
		const bcr = this.rootElement.getBoundingClientRect();
		const w = x - bcr.left;
		const h = y - bcr.top;
		const wabs = Math.abs( w );
		const habs = Math.abs( h );
		const whmax = Math.max( wabs, habs );
		const whmax2 = whmax * 2;

		clMain.toggle( "gsuiDragline-down", h > 0 );
		clMain.toggle( "gsuiDragline-right", w > 0 );
		stMain.top = `${ Math.min( h, 0 ) }px`;
		stMain.left = `${ Math.min( w, 0 ) }px`;
		stMain.width = `${ wabs }px`;
		stMain.height = `${ habs }px`;
		stSvg.width =
		stSvg.height = `${ whmax2 }px`;
		stSvg.margin = `${ -whmax }px`;
		GSUI.$setAttribute( this.#elements.svg, "viewBox", `0 0 ${ whmax2 } ${ whmax2 }` );
		GSUI.$setAttribute( this.#elements.polyline, "points", `${ whmax },${ whmax } ${ whmax + w },${ whmax + h }` );
	}
	#unlink() {
		const stMain = this.#elements.main.style;
		const stSvg = this.#elements.svg.style;

		stMain.top =
		stMain.left =
		stMain.width =
		stMain.height =
		stSvg.width =
		stSvg.height =
		stSvg.margin = "0px";
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
		this.rootElement.classList.remove( "gsuiDragline-dragging" );
		this.#dropAreas.forEach( el => {
			el.classList.remove( "gsuiDragline-dropActive" );
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
				el.classList.add( "gsuiDragline-dropActive" );
			} );
			this.rootElement.classList.add( "gsuiDragline-dragging" );
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
