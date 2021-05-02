"use strict";

class gsuiWindow extends HTMLElement {
	#wMin = 32
	#hMin = 32
	#show = false
	#parent = null;
	#minimized = false
	#maximized = false
	#restoreRect = Object.seal( { x: 0, y: 0, w: 32, h: 32 } )
	#mousemovePos = Object.seal( { x: 0, y: 0 } )
	#mousedownPos = Object.seal( { x: 0, y: 0 } )
	#mousedownHeadHeight = 0
	#children = GSUI.getTemplate( "gsui-window" )
	#elements = GSUI.findElements( this.#children, {
		icon: ".gsuiWindow-icon",
		wrap: ".gsuiWindow-wrap",
		head: ".gsuiWindow-head",
		title: ".gsuiWindow-title",
		content: ".gsuiWindow-content",
		handlers: ".gsuiWindow-handlers",
		headBtns: ".gsuiWindow-headBtns",
		headContent: ".gsuiWindow-headContent",
	} )

	constructor() {
		super();
		this.rect = Object.seal( { x: 0, y: 0, w: 32, h: 32 } );
		this.onresize =
		this.onfocusin =
		this.onresizing = null;
		Object.seal( this );

		this.#elements.icon.ondblclick = this.close.bind( this );
		this.#elements.headBtns.onclick = this.#onclickBtns.bind( this );
		this.#elements.head.onmousedown = this.#onmousedownHead.bind( this );
		this.#elements.title.ondblclick =
		this.#elements.headContent.ondblclick = this.#ondblclickTitle.bind( this );
		this.#elements.handlers.onmousedown = this.#onmousedownHandlers.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			GSUI.setAttribute( this, "tabindex", 0 );
			this.classList.add( "gsuiWindow" );
			this.append( ...this.#children );
			this.#children = null;
		}
	}

	// .........................................................................
	isOpen() { return this.#show; }
	open() { return this.openToggle( true ); }
	close() { return this.openToggle( false ); }
	openToggle( b ) {
		if ( b ) {
			this.#show = true;
			this.#setClass( "show", true );
			this.#parent._open( this );
		} else if ( !this.onclose || this.onclose() !== false ) {
			this.#show = false;
			this.#setClass( "show", false );
			this.#parent._close( this );
		}
	}

	setParent( p ) {
		this.#parent = p;
	}
	setId( id ) {
		this.dataset.id = id;
	}
	setTitle( t ) {
		this.#elements.title.textContent = t;
	}
	setTitleIcon( icon ) {
		this.#elements.icon.dataset.icon = icon;
	}
	empty() {
		while ( this.#elements.content.lastChild ) {
			this.#elements.content.lastChild.remove();
		}
		while ( this.#elements.headContent.lastChild ) {
			this.#elements.headContent.lastChild.remove();
		}
	}
	contentAppend( ...args ) {
		this.#elements.content.append( ...args );
	}
	headAppend( ...args ) {
		this.#elements.headContent.append( ...args );
	}

	focus() {
		if ( !this.contains( document.activeElement ) ) {
			setTimeout( this.focus.bind( this ), 50 );
		}
	}
	maximize() {
		if ( !this.#maximized ) {
			const st = this.style;

			this.#restoreRect.x = this.rect.x;
			this.#restoreRect.y = this.rect.y;
			this.#restoreRect.w = this.rect.w;
			if ( !this.#minimized ) {
				this.#restoreRect.h = this.rect.h;
			}
			st.top = st.left = st.right = st.bottom = st.width = st.height = "";
			this.#setClass( "maximized", true );
			this.#setClass( "minimized", false );
			this.#maximized = true;
			this.#minimized = false;
			this._callOnresize();
			this.focus();
			this.#parent._winMaximized( this.dataset.id );
		}
	}
	minimize() {
		if ( !this.#minimized ) {
			const rcRestore = this.#restoreRect;

			if ( !this.#maximized ) {
				Object.assign( rcRestore, this.rect );
			}
			this.#setClass( "minimized", true );
			this.#setClass( "maximized", false );
			this.#minimized = true;
			this.#maximized = false;
			this.setSize( rcRestore.w, this.#getHeadHeight(), "nocallback" );
			this.setPosition( rcRestore.x, rcRestore.y );
			this.#parent._winRestored( this.dataset.id );
		}
	}
	restore() {
		if ( this.#minimized || this.#maximized ) {
			const rcRestore = this.#restoreRect;

			this.focus();
			this.#setClass( "minimized", false );
			this.#setClass( "maximized", false );
			this.#minimized =
			this.#maximized = false;
			this.setSize( rcRestore.w, rcRestore.h );
			this.setPosition( rcRestore.x, rcRestore.y );
			this.#parent._winRestored( this.dataset.id );
		}
	}

	movable( b ) {
		this.#setClass( "movable", b );
	}
	getZIndex() {
		return +this.style.zIndex || 0;
	}
	setZIndex( z ) {
		this.style.zIndex = z;
	}
	setSize( w, h, nocb ) {
		this.rect.w = w;
		this.rect.h = h;
		this.style.width = `${ w }px`;
		this.style.height = `${ h }px`;
		if ( nocb !== "nocallback" ) {
			this._callOnresize();
		}
	}
	setMinSize( w, h ) {
		this.#wMin = w;
		this.#hMin = h;
	}
	setPosition( x, y ) {
		this.rect.x = x;
		this.rect.y = y;
		this.style.left = `${ x }px`;
		this.style.top = `${ y }px`;
	}
	_callOnresize() {
		if ( this.onresize ) {
			const bcr = this.#elements.content.getBoundingClientRect();

			this.onresize( bcr.width, bcr.height );
		}
	}

	// .........................................................................
	#onclickBtns( e ) {
		const act = e.target.dataset.icon;

		if ( act ) {
			this[ act ]();
		}
	}
	#ondblclickTitle( e ) {
		if ( e.target === e.currentTarget ) {
			this.#maximized
				? this.restore()
				: this.maximize();
		}
	}
	#onmousedownHead( e ) {
		const clTar = e.target.classList,
			clicked =
				clTar.contains( "gsuiWindow-head" ) ||
				clTar.contains( "gsuiWindow-title" ) ||
				clTar.contains( "gsuiWindow-headContent" );

		if ( clicked && !this.#maximized ) {
			this.#mousedownPos.x = e.clientX;
			this.#mousedownPos.y = e.clientY;
			this.#mousemovePos.x =
			this.#mousemovePos.y = 0;
			this.#setClass( "dragging", true );
			this.#parent._startMousemoving( "move",
				this.#onmousemoveHead.bind( this ),
				this.#onmouseupHead.bind( this ) );
		}
	}
	#onmousedownHandlers( e ) {
		const dir = e.target.dataset.dir;

		if ( dir ) {
			this.#mousedownPos.x = e.clientX;
			this.#mousedownPos.y = e.clientY;
			this.#mousemovePos.x =
			this.#mousemovePos.y = 0;
			this.#mousedownHeadHeight = this.#getHeadHeight();
			this.#setClass( "dragging", true );
			this.#parent._startMousemoving( `${ dir }-resize`,
				this.#onmousemoveHandler.bind( this, dir ),
				this.#onmouseupHandler.bind( this, dir ) );
		}
	}
	#onmousemoveHead( e ) {
		const x = e.clientX - this.#mousedownPos.x,
			y = e.clientY - this.#mousedownPos.y,
			mmPos = this.#mousemovePos,
			magnet = this.#calcCSSmagnet( "nesw", x, y );

		mmPos.x = x + magnet.x;
		mmPos.y = y + magnet.y;
		this.#setCSSrelativeMove( this.#elements.handlers.style, mmPos.x, mmPos.y );
		if ( !this.#parent._lowGraphics ) {
			this.#setCSSrelativeMove( this.#elements.wrap.style, mmPos.x, mmPos.y );
		}
	}
	#onmouseupHead() {
		const { x, y } = this.rect,
			m = this.#mousemovePos;

		this.#setClass( "dragging", false );
		this.#resetCSSrelative( this.#elements.wrap.style );
		this.#resetCSSrelative( this.#elements.handlers.style );
		if ( m.x || m.y ) {
			this.setPosition( x + m.x, y + m.y );
			this.#restoreRect.x = this.rect.x;
			this.#restoreRect.y = this.rect.y;
		}
	}
	#onmousemoveHandler( dir, e ) {
		const fnResize = this.onresizing,
			x = e.clientX - this.#mousedownPos.x,
			y = e.clientY - this.#mousedownPos.y,
			mmPos = this.#mousemovePos,
			magnet = this.#calcCSSmagnet( dir, x, y );

		mmPos.x = x + magnet.x;
		mmPos.y = y + magnet.y;
		this.#calcCSSrelativeResize( dir, mmPos );
		this.#setCSSrelativeResize( this.#elements.handlers.style, dir, mmPos );
		if ( !this.#parent._lowGraphics ) {
			this.#setCSSrelativeResize( this.#elements.wrap.style, dir, mmPos );
			if ( fnResize ) {
				const w = this.rect.w,
					h = this.rect.h - this.#mousedownHeadHeight;

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
	#onmouseupHandler( dir ) {
		const { x, y, w, h } = this.rect,
			m = this.#mousemovePos;

		this.#setClass( "dragging", false );
		this.#resetCSSrelative( this.#elements.wrap.style );
		this.#resetCSSrelative( this.#elements.handlers.style );
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

	// .........................................................................
	#setClass( clazz, b ) {
		this.classList.toggle( `gsuiWindow-${ clazz }`, b );
	}
	#getHeadHeight() {
		return this.#elements.head.getBoundingClientRect().height;
	}
	#calcCSSmagnet( dir, x, y ) {
		const rc = this.rect,
			dirW = dir.includes( "w" ),
			dirN = dir.includes( "n" ),
			dirE = dir.includes( "e" ),
			dirS = dir.includes( "s" ),
			tx = dirW ? rc.x + x : rc.x,
			ty = dirN ? rc.y + y : rc.y,
			parBCR = this.#parent.getBoundingClientRect(),
			wins = [
				...this.#parent._arrWindows,
				{
					dataset: {},
					rect: { x: 0, y: 0, w: parBCR.width - 4, h: parBCR.height - 4 },
				}
			];
		let mgX = 0,
			mgY = 0;

		if ( dirE && dirW ) {
			const mgXa = this.#findClosestWin( wins, "x", tx + rc.w, 2, 0 ),
				mgXb = this.#findClosestWin( wins, "x", tx, 0, 2 );

			if ( mgXa || mgXb ) {
				mgX = Math.abs( mgXa || Infinity ) < Math.abs( mgXb || Infinity ) ? mgXa : mgXb;
			}
		} else if ( dirE ) {
			mgX = this.#findClosestWin( wins, "x", tx + rc.w + x, 2, 0 );
		} else {
			mgX = this.#findClosestWin( wins, "x", tx, 0, 2 );
		}
		if ( dirS && dirN ) {
			const mgYa = this.#findClosestWin( wins, "y", ty + rc.h, 2, 0 ),
				mgYb = this.#findClosestWin( wins, "y", ty, 0, 2 );

			if ( mgYa || mgYb ) {
				mgY = Math.abs( mgYa || Infinity ) < Math.abs( mgYb || Infinity ) ? mgYa : mgYb;
			}
		} else if ( dirS ) {
			mgY = this.#findClosestWin( wins, "y", ty + rc.h + y, 2, 0 );
		} else {
			mgY = this.#findClosestWin( wins, "y", ty, 0, 2 );
		}
		return { x: mgX, y: mgY };
	}
	#findClosestWin( wins, dir, value, brdL, brdR ) {
		let vAbsMin = Infinity;

		return wins.reduce( ( vMin, win ) => {
			if ( win.dataset.id !== this.dataset.id && ( !win.isOpen || win.isOpen() ) ) {
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
	#resetCSSrelative( st ) {
		st.top =
		st.left =
		st.right =
		st.bottom = 0;
	}
	#setCSSrelativeMove( st, x, y ) {
		st.top    = `${  y }px`;
		st.left   = `${  x }px`;
		st.right  = `${ -x }px`;
		st.bottom = `${ -y }px`;
	}
	#calcCSSrelativeResize( dir, mm ) {
		const w = this.rect.w - this.#wMin,
			h = this.rect.h - this.#mousedownHeadHeight - this.#hMin;

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
	#setCSSrelativeResize( st, dir, mm ) {
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

customElements.define( "gsui-window", gsuiWindow );

Object.freeze( gsuiWindow );
