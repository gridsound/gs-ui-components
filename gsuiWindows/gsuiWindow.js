"use strict";

class gsuiWindow {
	constructor( parent, id ) {
		const root = GSUI.getTemplate( "gsui-window" );

		this.id = id;
		this.parent = parent;
		this.rootElement = root;
		this._elWrap = this._getElem( "wrap" );
		this._elHandlers = this._getElem( "handlers" );
		this._show =
		this._minimized =
		this._maximized = false;
		this.zIndex = 0;
		this.onresize =
		this.onfocusin =
		this.onresizing = null;
		this.rect = Object.seal( { x: 0, y: 0, w: 32, h: 32 } );
		this._restoreRect = Object.seal( { x: 0, y: 0, w: 32, h: 32 } );
		this._magnetPos = Object.seal( { x: 0, y: 0 } );
		this._mousemovePos = Object.seal( { x: 0, y: 0 } );
		this._mousedownPos = Object.seal( { x: 0, y: 0 } );
		this._mousedownHeadHeight = 0;
		this._wMin =
		this._hMin = 32;
		Object.seal( this );

		root.dataset.windowId = id;
		root.addEventListener( "focusin", parent._onfocusinWin.bind( parent, this ) );
		this._getElem( "icon" ).ondblclick = this.close.bind( this );
		this._getElem( "headBtns" ).onclick = this._onclickBtns.bind( this );
		this._getElem( "head" ).onmousedown = this._onmousedownHead.bind( this );
		this._getElem( "title" ).ondblclick =
		this._getElem( "headContent" ).ondblclick = this._ondblclickTitle.bind( this );
		this._elHandlers.onmousedown = this._onmousedownHandlers.bind( this );
		this._setZIndex( 0 );
		this.setTitle( id );
		this.setPosition( 0, 0 );
		this.setSize( 300, 150 );
	}

	open() { return this.openToggle( true ); }
	close() { return this.openToggle( false ); }
	openToggle( b ) {
		if ( b !== this._show ) {
			if ( b ) {
				this._show = true;
				this._setClass( "show", true );
				this.parent._open( this );
			} else if ( !this.onclose || this.onclose() !== false ) {
				this._show = false;
				this._setClass( "show", false );
				this.parent._close( this );
			}
		}
	}

	setIdAttr( id ) {
		this.rootElement.id = id;
	}
	setTitleIcon( icon ) {
		this._getElem( "icon" ).dataset.icon = icon;
	}
	empty() {
		const cnt = this._getElem( "content" ),
			headCnt = this._getElem( "headContent" );

		while ( cnt.lastChild ) {
			cnt.lastChild.remove();
		}
		while ( headCnt.lastChild ) {
			headCnt.lastChild.remove();
		}
	}
	append( ...args ) {
		this._getElem( "content" ).append( ...args );
	}
	headAppend( ...args ) {
		this._getElem( "headContent" ).append( ...args );
	}

	focus() {
		const root = this.rootElement;

		if ( !root.contains( document.activeElement ) ) {
			setTimeout( root.focus.bind( root ), 50 );
		}
	}
	maximize() {
		if ( !this._maximized ) {
			const st = this.rootElement.style;

			this._restoreRect.x = this.rect.x;
			this._restoreRect.y = this.rect.y;
			this._restoreRect.w = this.rect.w;
			if ( !this._minimized ) {
				this._restoreRect.h = this.rect.h;
			}
			st.top = st.left = st.right = st.bottom = st.width = st.height = "";
			this._setClass( "maximized", true );
			this._setClass( "minimized", false );
			this._maximized = true;
			this._minimized = false;
			this._callOnresize();
			this.focus();
			this.parent._winMaximized( this.id );
		}
	}
	minimize() {
		if ( !this._minimized ) {
			const rcRestore = this._restoreRect;

			if ( !this._maximized ) {
				Object.assign( rcRestore, this.rect );
			}
			this._setClass( "minimized", true );
			this._setClass( "maximized", false );
			this._minimized = true;
			this._maximized = false;
			this.setSize( rcRestore.w, this._getHeadHeight(), "nocallback" );
			this.setPosition( rcRestore.x, rcRestore.y );
			this.parent._winRestored( this.id );
		}
	}
	restore() {
		if ( this._minimized || this._maximized ) {
			const rcRestore = this._restoreRect;

			this.focus();
			this._setClass( "minimized", false );
			this._setClass( "maximized", false );
			this._minimized =
			this._maximized = false;
			this.setSize( rcRestore.w, rcRestore.h );
			this.setPosition( rcRestore.x, rcRestore.y );
			this.parent._winRestored( this.id );
		}
	}

	movable( b ) {
		this._setClass( "movable", b );
	}
	setTitle( t ) {
		this._getElem( "title" ).textContent = t;
	}
	setSize( w, h, nocb ) {
		this.rect.w = w;
		this.rect.h = h;
		this.rootElement.style.width = `${ w }px`;
		this.rootElement.style.height = `${ h }px`;
		if ( nocb !== "nocallback" ) {
			this._callOnresize();
		}
	}
	setMinSize( w, h ) {
		this._wMin = w;
		this._hMin = h;
	}
	setPosition( x, y ) {
		this.rect.x = x;
		this.rect.y = y;
		this.rootElement.style.left = `${ x }px`;
		this.rootElement.style.top = `${ y }px`;
	}

	// events:
	_onclickBtns( e ) {
		const act = e.target.dataset.icon;

		if ( act ) {
			this[ act ]();
		}
	}
	_ondblclickTitle( e ) {
		if ( e.target === e.currentTarget ) {
			this._maximized
				? this.restore()
				: this.maximize();
		}
	}
	_onmousedownHead( e ) {
		const clTar = e.target.classList,
			clicked =
				clTar.contains( "gsuiWindow-head" ) ||
				clTar.contains( "gsuiWindow-title" ) ||
				clTar.contains( "gsuiWindow-headContent" );

		if ( clicked && !this._maximized ) {
			this._mousedownPos.x = e.clientX;
			this._mousedownPos.y = e.clientY;
			this._mousemovePos.x =
			this._mousemovePos.y = 0;
			this._setClass( "dragging", true );
			this.parent._startMousemoving( "move",
				this._onmousemoveHead.bind( this ),
				this._onmouseupHead.bind( this ) );
		}
	}
	_onmousedownHandlers( e ) {
		const dir = e.target.dataset.dir;

		if ( dir ) {
			this._mousedownPos.x = e.clientX;
			this._mousedownPos.y = e.clientY;
			this._mousemovePos.x =
			this._mousemovePos.y = 0;
			this._mousedownHeadHeight = this._getHeadHeight();
			this._setClass( "dragging", true );
			this.parent._startMousemoving( `${ dir }-resize`,
				this._onmousemoveHandler.bind( this, dir ),
				this._onmouseupHandler.bind( this, dir ) );
		}
	}
	_onmousemoveHead( e ) {
		const x = e.clientX - this._mousedownPos.x,
			y = e.clientY - this._mousedownPos.y,
			mmPos = this._mousemovePos,
			magnet = this._calcCSSmagnet( "nesw", x, y );

		mmPos.x = x + magnet.x;
		mmPos.y = y + magnet.y;
		this._setCSSrelativeMove( this._elHandlers.style, mmPos.x, mmPos.y );
		if ( !this.parent._lowGraphics ) {
			this._setCSSrelativeMove( this._elWrap.style, mmPos.x, mmPos.y );
		}
	}
	_onmouseupHead() {
		const { x, y } = this.rect,
			m = this._mousemovePos;

		this._setClass( "dragging", false );
		this._resetCSSrelative( this._elWrap.style );
		this._resetCSSrelative( this._elHandlers.style );
		if ( m.x || m.y ) {
			this.setPosition( x + m.x, y + m.y );
			this._restoreRect.x = this.rect.x;
			this._restoreRect.y = this.rect.y;
		}
	}
	_onmousemoveHandler( dir, e ) {
		const fnResize = this.onresizing,
			x = e.clientX - this._mousedownPos.x,
			y = e.clientY - this._mousedownPos.y,
			mmPos = this._mousemovePos,
			magnet = this._calcCSSmagnet( dir, x, y );

		mmPos.x = x + magnet.x;
		mmPos.y = y + magnet.y;
		this._calcCSSrelativeResize( dir, mmPos );
		this._setCSSrelativeResize( this._elHandlers.style, dir, mmPos );
		if ( !this.parent._lowGraphics ) {
			this._setCSSrelativeResize( this._elWrap.style, dir, mmPos );
			if ( fnResize ) {
				const w = this.rect.w,
					h = this.rect.h - this._mousedownHeadHeight;

				switch ( dir ) {
					case "n":  fnResize( w,     h - y ); break;
					case "w":  fnResize( w - x, h     ); break;
					case "e":  fnResize( w + x, h     ); break;
					case "s":  fnResize( w,     h + y ); break;
					case "nw": fnResize( w - x, h - y ); break;
					case "ne": fnResize( w + x, h - y ); break;
					case "sw": fnResize( w - x, h + y ); break;
					case "se": fnResize( w + x, h + y ); break;
				}
			}
		}
	}
	_onmouseupHandler( dir ) {
		const { x, y, w, h } = this.rect,
			m = this._mousemovePos;

		this._setClass( "dragging", false );
		this._resetCSSrelative( this._elWrap.style );
		this._resetCSSrelative( this._elHandlers.style );
		if ( m.x || m.y ) {
			switch ( dir ) {
				case "e" : this.setSize( w + m.x, h       ); break;
				case "se": this.setSize( w + m.x, h + m.y ); break;
				case "s" : this.setSize( w,       h + m.y ); break;
				case "sw": this.setSize( w - m.x, h + m.y ); this.setPosition( x + m.x, y       ); break;
				case "w" : this.setSize( w - m.x, h       ); this.setPosition( x + m.x, y       ); break;
				case "nw": this.setSize( w - m.x, h - m.y ); this.setPosition( x + m.x, y + m.y ); break;
				case "n" : this.setSize( w,       h - m.y ); this.setPosition( x,       y + m.y ); break;
				case "ne": this.setSize( w + m.x, h - m.y ); this.setPosition( x,       y + m.y ); break;
			}
		}
	}

	// private:
	_getElem( c ) {
		return this.rootElement.querySelector( `.gsuiWindow-${ c }` );
	}
	_attachTo( parentElem ) {
		parentElem.append( this.rootElement );
	}
	_setClass( clazz, b ) {
		this.rootElement.classList.toggle( `gsuiWindow-${ clazz }`, b );
	}
	_setZIndex( z ) {
		this.zIndex =
		this.rootElement.style.zIndex = z;
	}
	_callOnresize() {
		if ( this.onresize ) {
			const bcr = this._getElem( "content" ).getBoundingClientRect();

			this.onresize( bcr.width, bcr.height );
		}
	}
	_getHeadHeight() {
		return this._getElem( "head" ).getBoundingClientRect().height;
	}
	_calcCSSmagnet( dir, x, y ) {
		const rc = this.rect,
			dirW = dir.includes( "w" ),
			dirN = dir.includes( "n" ),
			dirE = dir.includes( "e" ),
			dirS = dir.includes( "s" ),
			tx = dirW ? rc.x + x : rc.x,
			ty = dirN ? rc.y + y : rc.y,
			parBCR = this.parent.rootElement.getBoundingClientRect(),
			wins = [
				...this.parent._arrWindows,
				{ _show: true, rect: { x: 0, y: 0, w: parBCR.width - 4, h: parBCR.height - 4 } }
			];
		let mgX = 0,
			mgY = 0;

		if ( dirE && dirW ) {
			const mgXa = this._findClosestWin( wins, "x", tx + rc.w, 2, 0 ),
				mgXb = this._findClosestWin( wins, "x", tx, 0, 2 );

			if ( mgXa || mgXb ) {
				mgX = Math.abs( mgXa || Infinity ) < Math.abs( mgXb || Infinity ) ? mgXa : mgXb;
			}
		} else if ( dirE ) {
			mgX = this._findClosestWin( wins, "x", tx + rc.w + x, 2, 0 );
		} else {
			mgX = this._findClosestWin( wins, "x", tx, 0, 2 );
		}
		if ( dirS && dirN ) {
			const mgYa = this._findClosestWin( wins, "y", ty + rc.h, 2, 0 ),
				mgYb = this._findClosestWin( wins, "y", ty, 0, 2 );

			if ( mgYa || mgYb ) {
				mgY = Math.abs( mgYa || Infinity ) < Math.abs( mgYb || Infinity ) ? mgYa : mgYb;
			}
		} else if ( dirS ) {
			mgY = this._findClosestWin( wins, "y", ty + rc.h + y, 2, 0 );
		} else {
			mgY = this._findClosestWin( wins, "y", ty, 0, 2 );
		}
		return { x: mgX, y: mgY };
	}
	_findClosestWin( wins, dir, value, brdL, brdR ) {
		let vAbsMin = Infinity;

		return wins.reduce( ( vMin, win ) => {
			if ( win._show && win.id !== this.id ) {
				const wrc = win.rect,
					wrcDir = wrc[ dir ],
					v1 = wrcDir - brdL - value,
					v2 = wrcDir + ( dir === "x" ? wrc.w : wrc.h ) + brdR - value,
					v1Abs = Math.abs( v1 ),
					v2Abs = Math.abs( v2 ),
					abs = Math.min( v1Abs, v2Abs );

				if ( abs < 4 && abs < vAbsMin ) {
					vAbsMin = abs;
					return v1Abs < v2Abs ? v1 : v2;
				}
			}
			return vMin;
		}, 0 );
	}
	_resetCSSrelative( st ) {
		st.top =
		st.left =
		st.right =
		st.bottom = 0;
	}
	_setCSSrelativeMove( st, x, y ) {
		st.top    = `${  y }px`;
		st.left   = `${  x }px`;
		st.right  = `${ -x }px`;
		st.bottom = `${ -y }px`;
	}
	_calcCSSrelativeResize( dir, mm ) {
		const w = this.rect.w - this._wMin,
			h = this.rect.h - this._mousedownHeadHeight - this._hMin;

		switch ( dir ) {
			case "n" : if ( h - mm.y < 0 ) { mm.y =  h; } break;
			case "s" : if ( h + mm.y < 0 ) { mm.y = -h; } break;
			case "w" :                                    if ( w - mm.x < 0 ) { mm.x =  w; } break;
			case "e" :                                    if ( w + mm.x < 0 ) { mm.x = -w; } break;
			case "nw": if ( h - mm.y < 0 ) { mm.y =  h; } if ( w - mm.x < 0 ) { mm.x =  w; } break;
			case "ne": if ( h - mm.y < 0 ) { mm.y =  h; } if ( w + mm.x < 0 ) { mm.x = -w; } break;
			case "sw": if ( h + mm.y < 0 ) { mm.y = -h; } if ( w - mm.x < 0 ) { mm.x =  w; } break;
			case "se": if ( h + mm.y < 0 ) { mm.y = -h; } if ( w + mm.x < 0 ) { mm.x = -w; } break;
		}
	}
	_setCSSrelativeResize( st, dir, mm ) {
		switch ( dir ) {
			case "n" : st.top    = `${  mm.y }px`; break;
			case "s" : st.bottom = `${ -mm.y }px`; break;
			case "w" : st.left   = `${  mm.x }px`; break;
			case "e" : st.right  = `${ -mm.x }px`; break;
			case "nw": st.left   = `${  mm.x }px`; st.top    = `${  mm.y }px`; break;
			case "ne": st.right  = `${ -mm.x }px`; st.top    = `${  mm.y }px`; break;
			case "sw": st.left   = `${  mm.x }px`; st.bottom = `${ -mm.y }px`; break;
			case "se": st.right  = `${ -mm.x }px`; st.bottom = `${ -mm.y }px`; break;
		}
	}
}

Object.freeze( gsuiWindow );
