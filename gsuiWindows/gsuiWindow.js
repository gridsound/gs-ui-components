"use strict";

class gsuiWindow extends HTMLElement {
	#wMin = 32;
	#hMin = 32;
	#show = false;
	#parent = null;
	#minimized = false;
	#maximized = false;
	#lowGraphics = false;
	#restoreRect = Object.seal( { x: 0, y: 0, w: 32, h: 32 } );
	#mousemovePos = Object.seal( { x: 0, y: 0 } );
	#mousedownPos = Object.seal( { x: 0, y: 0 } );
	#mousedownHeadHeight = 0;
	#children = GSUI.$getTemplate( "gsui-window" );
	#elements = GSUI.$findElements( this.#children, {
		icon: ".gsuiWindow-icon",
		wrap: ".gsuiWindow-wrap",
		head: ".gsuiWindow-head",
		title: ".gsuiWindow-title",
		content: ".gsuiWindow-content",
		handlers: ".gsuiWindow-handlers",
		headBtns: ".gsuiWindow-headBtns",
		headContent: ".gsuiWindow-headContent",
	} );

	constructor() {
		super();
		this.rect = Object.seal( { x: 0, y: 0, w: 32, h: 32 } );
		Object.seal( this );

		this.#elements.icon.ondblclick = this.$close.bind( this );
		this.#elements.headBtns.onclick = this.#onclickBtns.bind( this );
		this.#elements.head.onmousedown = this.#onmousedownHead.bind( this );
		this.#elements.title.ondblclick =
		this.#elements.headContent.ondblclick = this.#ondblclickTitle.bind( this );
		this.#elements.handlers.onmousedown = this.#onmousedownHandlers.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			GSUI.$setAttribute( this, "tabindex", 0 );
			this.append( ...this.#children );
			this.#children = null;
		}
	}
	static get observedAttributes() {
		return [ "x", "y", "w", "h", "wmin", "hmin", "lowgraphics", "icon", "title" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		switch ( prop ) {
			case "y": this.style.top = `${ this.rect.y = +val }px`; break;
			case "x": this.style.left = `${ this.rect.x = +val }px`; break;
			case "w": this.style.width = `${ this.rect.w = +val }px`; break;
			case "h": this.style.height = `${ this.rect.h = +val }px`; break;
			case "wmin": this.#wMin = +val; break;
			case "hmin": this.#hMin = +val; break;
			case "lowgraphics": this.#lowGraphics = val !== null; break;
			case "icon": this.#elements.icon.dataset.icon = val; break;
			case "title": this.#elements.title.textContent = val; break;
		}
	}

	// .........................................................................
	$isOpen() { return this.#show; }
	$open() { return this.$openToggle( true ); }
	$close() { return this.$openToggle( false ); }
	$openToggle( b ) {
		if ( b !== this.#show ) {
			if ( b ) {
				this.#show = true;
				this.#setClass( "show", true );
				this.#parent._open( this );
			} else if ( !this.onclose || this.onclose() !== false ) {
				this.#show = false;
				this.#setClass( "show", false );
				GSUI.$emptyElement( this.#elements.content );
				this.#parent._close( this );
			}
		} else if ( this.#minimized ) {
			this.$restore();
		}
	}

	// .........................................................................
	$setParent( p ) {
		this.#parent = p;
	}
	$empty() {
		GSUI.$emptyElement( this.#elements.content );
		GSUI.$emptyElement( this.#elements.headContent );
	}
	$contentAppend( ...args ) {
		this.#elements.content.append( ...args );
	}
	$headAppend( ...args ) {
		this.#elements.headContent.append( ...args );
	}

	// .........................................................................
	$maximize() {
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
			this.focus( { preventScroll: true } );
		}
	}
	$minimize() {
		if ( !this.#minimized ) {
			const rcRestore = this.#restoreRect;

			if ( !this.#maximized ) {
				Object.assign( rcRestore, this.rect );
			}
			this.#setClass( "minimized", true );
			this.#setClass( "maximized", false );
			this.#minimized = true;
			this.#maximized = false;
			GSUI.$setAttribute( this, {
				x: rcRestore.x,
				y: rcRestore.y,
				w: rcRestore.w,
				h: this.#getHeadHeight(),
			} );
			GSUI.$emptyElement( this.#elements.content );
			this.#parent._close( this );
		}
	}
	$restore() {
		if ( this.#minimized || this.#maximized ) {
			const rcRestore = this.#restoreRect;
			const wasMinimized = this.#minimized;

			this.focus( { preventScroll: true } );
			this.#setClass( "minimized", false );
			this.#setClass( "maximized", false );
			this.#minimized =
			this.#maximized = false;
			GSUI.$setAttribute( this, {
				x: rcRestore.x,
				y: rcRestore.y,
				w: rcRestore.w,
				h: rcRestore.h,
			} );
			if ( wasMinimized ) {
				this.#parent._open( this );
			}
		}
	}

	// .........................................................................
	#onclickBtns( e ) {
		switch ( e.target.dataset.icon ) {
			case "minimize": return this.$minimize();
			case "restore": return this.$restore();
			case "maximize": return this.$maximize();
			case "close": return this.$close();
		}
	}
	#ondblclickTitle( e ) {
		if ( e.target === e.currentTarget ) {
			this.#maximized
				? this.$restore()
				: this.$maximize();
		}
	}
	#onmousedownHead( e ) {
		const clTar = e.target.classList;
		const clicked =
			clTar.contains( "gsuiWindow-head" ) ||
			clTar.contains( "gsuiWindow-icon" ) ||
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
		const x = e.clientX - this.#mousedownPos.x;
		const y = e.clientY - this.#mousedownPos.y;
		const mmPos = this.#mousemovePos;
		const magnet = this.#calcCSSmagnet( "nesw", x, y );

		mmPos.x = x + magnet.x;
		mmPos.y = y + magnet.y;
		this.#setCSSrelativeMove( this.#elements.handlers.style, mmPos );
		if ( !this.#lowGraphics ) {
			this.#setCSSrelativeMove( this.#elements.wrap.style, mmPos );
		}
	}
	#onmouseupHead() {
		const { x, y } = this.rect;
		const m = this.#mousemovePos;

		this.#setClass( "dragging", false );
		this.#resetCSSrelative( this.#elements.wrap.style );
		this.#resetCSSrelative( this.#elements.handlers.style );
		if ( m.x || m.y ) {
			GSUI.$setAttribute( this, {
				x: x + m.x,
				y: y + m.y,
			} );
			this.#restoreRect.x = this.rect.x;
			this.#restoreRect.y = this.rect.y;
		}
	}
	#onmousemoveHandler( dir, e ) {
		const mmPos = this.#mousemovePos;
		const x = e.clientX - this.#mousedownPos.x;
		const y = e.clientY - this.#mousedownPos.y;
		const magnet = this.#calcCSSmagnet( dir, x, y );

		mmPos.x = x + magnet.x;
		mmPos.y = y + magnet.y;
		this.#calcCSSrelativeResize( dir, mmPos );
		this.#setCSSrelativeResize( this.#elements.handlers.style, dir, mmPos );
		if ( !this.#lowGraphics ) {
			this.#setCSSrelativeResize( this.#elements.wrap.style, dir, mmPos );
		}
	}
	#onmouseupHandler( dir ) {
		const { x, y, w, h } = this.rect;
		const m = this.#mousemovePos;

		this.#setClass( "dragging", false );
		this.#resetCSSrelative( this.#elements.wrap.style );
		this.#resetCSSrelative( this.#elements.handlers.style );
		if ( m.x || m.y ) {
			switch ( dir ) {
				case "e":  GSUI.$setAttribute( this, { w: w + m.x, h          } ); break;
				case "se": GSUI.$setAttribute( this, { w: w + m.x, h: h + m.y } ); break;
				case "s":  GSUI.$setAttribute( this, { w,          h: h + m.y } ); break;
				case "sw": GSUI.$setAttribute( this, { w: w - m.x, h: h + m.y, x: x + m.x, y          } ); break;
				case "w":  GSUI.$setAttribute( this, { w: w - m.x, h         , x: x + m.x, y          } ); break;
				case "nw": GSUI.$setAttribute( this, { w: w - m.x, h: h - m.y, x: x + m.x, y: y + m.y } ); break;
				case "n":  GSUI.$setAttribute( this, { w,          h: h - m.y, x,          y: y + m.y } ); break;
				case "ne": GSUI.$setAttribute( this, { w: w + m.x, h: h - m.y, x,          y: y + m.y } ); break;
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
		const rc = this.rect;
		const dirW = dir.includes( "w" );
		const dirN = dir.includes( "n" );
		const dirE = dir.includes( "e" );
		const dirS = dir.includes( "s" );
		const tx = dirW ? rc.x + x : rc.x;
		const ty = dirN ? rc.y + y : rc.y;
		const parBCR = this.#parent.getBoundingClientRect();
		const wins = [
			...this.#parent._arrWindows,
			{
				dataset: {},
				rect: { x: 0, y: 0, w: parBCR.width, h: parBCR.height },
			}
		];
		let mgX = 0;
		let mgY = 0;

		if ( dirE && dirW ) {
			const mgXa = this.#findClosestWin( wins, "x", tx + rc.w, 2, 0 );
			const mgXb = this.#findClosestWin( wins, "x", tx, 0, 2 );

			if ( mgXa || mgXb ) {
				mgX = Math.abs( mgXa || Infinity ) < Math.abs( mgXb || Infinity ) ? mgXa : mgXb;
			}
		} else if ( dirE ) {
			mgX = this.#findClosestWin( wins, "x", tx + rc.w + x, 2, 0 );
		} else {
			mgX = this.#findClosestWin( wins, "x", tx, 0, 2 );
		}
		if ( dirS && dirN ) {
			const mgYa = this.#findClosestWin( wins, "y", ty + rc.h, 2, 0 );
			const mgYb = this.#findClosestWin( wins, "y", ty, 0, 2 );

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
			if ( win.dataset.id !== this.dataset.id && ( !win.$isOpen || win.$isOpen() ) ) {
				const wrc = win.rect;
				const wrcDir = wrc[ dir ];
				const v1 = wrcDir - brdL - value;
				const v2 = wrcDir + ( dir === "x" ? wrc.w : wrc.h ) + brdR - value;
				const v1Abs = Math.abs( v1 );
				const v2Abs = Math.abs( v2 );
				const abs = Math.min( v1Abs, v2Abs );

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
	#setCSSrelativeMove( st, p ) {
		const top = parseFloat( this.style.top );
		const left = parseFloat( this.style.left );
		const minX = -left - this.clientWidth + ( 3 * 24 + 10 );
		const minY = -top;
		const maxX = this.parentNode.clientWidth - left - 24 - 10;
		const maxY = this.parentNode.clientHeight - top - 24;

		p.y = Math.max( minY, Math.min( p.y, maxY ) );
		p.x = Math.max( minX, Math.min( p.x, maxX ) );
		st.top    = `${  p.y }px`;
		st.left   = `${  p.x }px`;
		st.right  = `${ -p.x }px`;
		st.bottom = `${ -p.y }px`;
	}
	#calcCSSrelativeResize( dir, mm ) {
		const w = this.rect.w - this.#wMin;
		const h = this.rect.h - this.#mousedownHeadHeight - this.#hMin;

		switch ( dir ) {
			case "n":  if ( h - mm.y < 0 ) { mm.y =  h; } break;
			case "s":  if ( h + mm.y < 0 ) { mm.y = -h; } break;
			case "w":                                     if ( w - mm.x < 0 ) { mm.x =  w; } break;
			case "e":                                     if ( w + mm.x < 0 ) { mm.x = -w; } break;
			case "nw": if ( h - mm.y < 0 ) { mm.y =  h; } if ( w - mm.x < 0 ) { mm.x =  w; } break;
			case "ne": if ( h - mm.y < 0 ) { mm.y =  h; } if ( w + mm.x < 0 ) { mm.x = -w; } break;
			case "sw": if ( h + mm.y < 0 ) { mm.y = -h; } if ( w - mm.x < 0 ) { mm.x =  w; } break;
			case "se": if ( h + mm.y < 0 ) { mm.y = -h; } if ( w + mm.x < 0 ) { mm.x = -w; } break;
		}
	}
	#setCSSrelativeResize( st, dir, mm ) {
		switch ( dir ) {
			case "n":  st.top    = `${  mm.y }px`; break;
			case "s":  st.bottom = `${ -mm.y }px`; break;
			case "w":  st.left   = `${  mm.x }px`; break;
			case "e":  st.right  = `${ -mm.x }px`; break;
			case "nw": st.left   = `${  mm.x }px`; st.top    = `${  mm.y }px`; break;
			case "ne": st.right  = `${ -mm.x }px`; st.top    = `${  mm.y }px`; break;
			case "sw": st.left   = `${  mm.x }px`; st.bottom = `${ -mm.y }px`; break;
			case "se": st.right  = `${ -mm.x }px`; st.bottom = `${ -mm.y }px`; break;
		}
	}
}

Object.freeze( gsuiWindow );
customElements.define( "gsui-window", gsuiWindow );
