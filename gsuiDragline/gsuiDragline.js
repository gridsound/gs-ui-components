"use strict";

class gsuiDragline extends gsui0ne {
	#getDropAreas = GSUnoop;
	#linkedTo = $noop;
	#dropAreas = null;
	#evKeydown = null;
	#evMouseup = null;
	#evMousemove = null;

	constructor() {
		super( {
			$cmpName: "gsuiDragline",
			$tagName: "gsui-dragline",
			$elements: {
				$main: ".gsuiDragline-main",
				$svg: ".gsuiDragline-line",
				$polyline: ".gsuiDragline-line polyline",
				$to: ".gsuiDragline-to",
			},
			$attributes: {
				tabindex: -1,
			},
		} );
		Object.seal( this );
		this.$elements.$to.$on( "mousedown", this.#onmousedownTo.bind( this ) );
	}

	// .........................................................................
	$onmessage( ev, val ) {
		switch ( ev ) {
			case GSEV_DRAGLINE_DRAW: this.#redraw(); break;
			case GSEV_DRAGLINE_LINKTO: this.#linkTo( val ); break;
			case GSEV_DRAGLINE_DROPAREAS: this.#getDropAreas = val; break;
		}
	}

	// .........................................................................
	#linkTo( el ) {
		const el2 = $( el );
		const ok = el2.$size() > 0;

		this.#linkedTo = el2;
		this.$this.$togClass( "gsuiDragline-linked", ok );
		ok ? this.#redraw() : this.#unlink();
	}
	#redraw() {
		if ( this.#linkedTo.$size() ) {
			const bcr = this.#linkedTo.$bcr();

			this.#render( bcr.x, bcr.y );
		}
	}
	#render( x, y ) {
		const bcr = this.$this.$bcr();
		const w = x - bcr.x;
		const h = y - bcr.y;
		const wabs = Math.abs( w );
		const habs = Math.abs( h );
		const whmax = Math.max( wabs, habs );
		const whmax2 = whmax * 2;

		this.$element
			.$togClass( "gsuiDragline-down", h > 0 )
			.$togClass( "gsuiDragline-right", w > 0 )
			.$css( {
				top: `${ Math.min( h, 0 ) }px`,
				left: `${ Math.min( w, 0 ) }px`,
				width: `${ wabs }px`,
				height: `${ habs }px`,
			} );
		this.$elements.$svg.$viewbox( whmax2, whmax2 ).$css( {
			width: `${ whmax2 }px`,
			height: `${ whmax2 }px`,
			margin: `${ -whmax }px`,
		} );
		this.$elements.$polyline.$setAttr( "points", `${ whmax },${ whmax } ${ whmax + w },${ whmax + h }` );
	}
	#unlink() {
		this.$element.$css( {
			top: 0,
			left: 0,
			width: 0,
			height: 0,
		} );
		this.$elements.$svg.$css( {
			width: 0,
			height: 0,
			margin: 0,
		} );
	}
	#cancelDrag() {
		this.#resetDrag();
		this.#linkedTo.$size()
			? this.#redraw()
			: this.#unlink();
	}
	#resetDrag() {
		this.$this.$rmClass( "gsuiDragline-dragging" );
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
			this.#dropAreas = this.#getDropAreas();
			this.#dropAreas.forEach( el => {
				el.onmouseup = this.#onmouseupDrop.bind( this );
				GSUdomAddClass( el, "gsuiDragline-dropActive" );
			} );
			this.$this.$addClass( "gsuiDragline-dragging" );
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
		const tar = $( e.currentTarget );

		if ( !this.#linkedTo.$is( tar ) ) {
			this.#linkedTo = tar;
			this.$this.$dispatch( GSEV_DRAGLINE_CHANGE, tar );
		}
		this.#resetDrag();
		this.#redraw();
		return false;
	}
	#onmouseup() {
		if ( this.#linkedTo.$size() ) {
			this.#linkedTo = $noop;
			this.$this.$dispatch( GSEV_DRAGLINE_CHANGE, $noop );
		}
		this.#cancelDrag();
	}
	#onmousemove( e ) {
		this.#render( e.pageX, e.pageY );
	}
}

GSUdomDefine( "gsui-dragline", gsuiDragline );
