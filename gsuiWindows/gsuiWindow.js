"use strict";

class gsuiWindow extends gsui0ne {
	#wMin = 32;
	#hMin = 32;
	#show = false;
	#minimized = false;
	#maximized = false;
	#mousemovePos = Object.seal( { x: 0, y: 0 } );
	#mousedownPos = Object.seal( { x: 0, y: 0 } );
	#mousedownHeadHeight = 24;
	#resetCSS = { top: 0, left: 0, right: 0, bottom: 0 };
	#rect = Object.seal( { x: 0, y: 0, w: 32, h: 32 } );

	constructor() {
		super( {
			$cmpName: "gsuiWindow",
			$tagName: "gsui-window",
			$elements: {
				$icon: ".gsuiWindow-icon",
				$wrap: ".gsuiWindow-wrap",
				$head: ".gsuiWindow-head",
				$name: ".gsuiWindow-name",
				$content: ".gsuiWindow-content",
				$handlers: ".gsuiWindow-handlers",
				$headBtns: ".gsuiWindow-headBtns",
				$headContent: ".gsuiWindow-headContent",
			},
			$attributes: { tabindex: 0 },
		} );
		Object.seal( this );
		this.$elements.$headBtns.onclick = this.#onclickBtns.bind( this );
		this.$elements.$head.onpointerdown = this.#onptrdownHead.bind( this );
		this.$elements.$handlers.onpointerdown = this.#onptrdownHandlers.bind( this );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "x", "y", "w", "h", "wmin", "hmin", "icon", "name" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "y": this.style.top = `${ this.#rect.y = +val }px`; break;
			case "x": this.style.left = `${ this.#rect.x = +val }px`; break;
			case "w": this.style.width = `${ this.#rect.w = +val }px`; break;
			case "h": this.style.height = `${ this.#rect.h = +val }px`; break;
			case "wmin": this.#wMin = +val; break;
			case "hmin": this.#hMin = +val; break;
			case "icon": this.$elements.$icon.dataset.icon = val; break;
			case "name": this.$elements.$name.textContent = val; break;
		}
	}

	// .........................................................................
	$getRect() { return this.#rect; }
	$isOpen() { return this.#show; }
	$open() { return this.$openToggle( true ); }
	$close() { return this.$openToggle( false ); }
	$openToggle( b ) {
		if ( b !== this.#show ) {
			if ( b ) {
				this.#show = true;
				GSUdomSetAttr( this, "show" );
				GSUdomDispatch( this, GSEV_WINDOW_OPEN );
			} else if ( !this.onclose || this.onclose() !== false ) {
				this.#show = false;
				GSUdomRmAttr( this, "show" );
				GSUdomEmpty( this.$elements.$content );
				GSUdomDispatch( this, GSEV_WINDOW_CLOSE );
			}
		} else if ( this.#minimized ) {
			this.$restore();
		}
	}

	// .........................................................................
	$empty() {
		GSUdomEmpty( this.$elements.$content );
		GSUdomEmpty( this.$elements.$headContent );
	}
	$contentAppend( ...args ) {
		this.$elements.$content.append( ...args );
	}
	$headAppend( ...args ) {
		this.$elements.$headContent.append( ...args );
	}

	// .........................................................................
	$maximize() {
		if ( !this.#maximized ) {
			const wasMinimized = this.#minimized;

			GSUdomSetAttr( this, { minimized: false, maximized: true } );
			this.#minimized = false;
			this.#maximized = true;
			if ( wasMinimized ) {
				GSUdomDispatch( this, GSEV_WINDOW_OPEN );
			}
			this.focus( { preventScroll: true } );
		}
	}
	$minimize() {
		if ( !this.#minimized ) {
			GSUdomSetAttr( this, { minimized: true, maximized: false } );
			this.#minimized = true;
			this.#maximized = false;
			GSUdomEmpty( this.$elements.$content );
			GSUdomDispatch( this, GSEV_WINDOW_CLOSE );
		}
	}
	$restore() {
		if ( this.#minimized || this.#maximized ) {
			const wasMinimized = this.#minimized;

			this.focus( { preventScroll: true } );
			GSUdomSetAttr( this, { minimized: false, maximized: false } );
			this.#minimized =
			this.#maximized = false;
			if ( wasMinimized ) {
				GSUdomDispatch( this, GSEV_WINDOW_OPEN );
			}
		}
	}

	// .........................................................................
	#onclickBtns( e ) {
		switch ( e.target.dataset.action ) {
			case "minimize": return this.$minimize();
			case "restore": return this.$restore();
			case "maximize": return this.$maximize();
			case "close": return this.$close();
		}
	}
	#onptrdownHead( e ) {
		const clicked =
			GSUdomHasClass( e.target, "gsuiWindow-head" ) ||
			GSUdomHasClass( e.target, "gsuiWindow-icon" ) ||
			GSUdomHasClass( e.target, "gsuiWindow-name" ) ||
			GSUdomHasClass( e.target, "gsuiWindow-headContent" );

		if ( GSUdomIsDblClick( e ) ) {
			this.#maximized
				? this.$restore()
				: this.$maximize();
		} else if ( e.button === 0 && clicked && !this.#maximized ) {
			this.#mousedownPos.x = e.clientX;
			this.#mousedownPos.y = e.clientY;
			this.#mousemovePos.x =
			this.#mousemovePos.y = 0;
			this.setPointerCapture( e.pointerId );
			GSUdomUnselect();
			GSUdomStyle( this, "cursor", "move" );
			GSUdomSetAttr( this, "dragging" );
			this.onpointermove = this.#onptrmoveHead.bind( this );
			this.onpointerup = this.#onptrupHead.bind( this );
		}
	}
	#onptrdownHandlers( e ) {
		const dir = e.target.dataset.dir;

		if ( e.button === 0 && dir ) {
			this.#mousedownPos.x = e.clientX;
			this.#mousedownPos.y = e.clientY;
			this.#mousemovePos.x =
			this.#mousemovePos.y = 0;
			this.setPointerCapture( e.pointerId );
			GSUdomUnselect();
			GSUdomStyle( this, "cursor", `${ dir }-resize` );
			GSUdomSetAttr( this, "dragging" );
			this.onpointermove = this.#onptrmoveHandler.bind( this, dir );
			this.onpointerup = this.#onptrupHandler.bind( this, dir );
		}
	}
	#onptrmoveHead( e ) {
		const x = e.clientX - this.#mousedownPos.x;
		const y = e.clientY - this.#mousedownPos.y;
		const mmPos = this.#mousemovePos;
		const magnet = this.#calcCSSmagnet( "nesw", x, y );

		mmPos.x = x + magnet.x;
		mmPos.y = y + magnet.y;
		this.#setCSSrelativeMove( this.$elements.$handlers.style, mmPos );
		if ( !GSUdomHasAttr( this.parentNode, "lowgraphics" ) ) {
			this.#setCSSrelativeMove( this.$elements.$wrap.style, mmPos );
		}
	}
	#onptrupHead( e ) {
		const { x, y } = this.#rect;
		const m = this.#mousemovePos;

		this.onpointermove =
		this.onpointerup = null;
		this.releasePointerCapture( e.pointerId );
		GSUdomRmAttr( this, "dragging" );
		GSUdomStyle( this, "cursor", "" );
		GSUdomStyle( this.$elements.$wrap, this.#resetCSS );
		GSUdomStyle( this.$elements.$handlers, this.#resetCSS );
		if ( m.x || m.y ) {
			GSUdomSetAttr( this, {
				x: x + m.x,
				y: y + m.y,
			} );
		}
	}
	#onptrmoveHandler( dir, e ) {
		const mmPos = this.#mousemovePos;
		const x = e.clientX - this.#mousedownPos.x;
		const y = e.clientY - this.#mousedownPos.y;
		const magnet = this.#calcCSSmagnet( dir, x, y );

		mmPos.x = x + magnet.x;
		mmPos.y = y + magnet.y;
		this.#calcCSSrelativeResize( dir, mmPos );
		this.#setCSSrelativeResize( this.$elements.$handlers.style, dir, mmPos );
		if ( !GSUdomHasAttr( this.parentNode, "lowgraphics" ) ) {
			this.#setCSSrelativeResize( this.$elements.$wrap.style, dir, mmPos );
		}
	}
	#onptrupHandler( dir, e ) {
		const { x, y, w, h } = this.#rect;
		const m = this.#mousemovePos;

		this.onpointermove =
		this.onpointerup = null;
		this.releasePointerCapture( e.pointerId );
		GSUdomRmAttr( this, "dragging" );
		GSUdomStyle( this, "cursor", "" );
		GSUdomStyle( this.$elements.$wrap, this.#resetCSS );
		GSUdomStyle( this.$elements.$handlers, this.#resetCSS );
		if ( m.x || m.y ) {
			switch ( dir ) {
				case "e":  GSUdomSetAttr( this, { w: w + m.x, h          } ); break;
				case "se": GSUdomSetAttr( this, { w: w + m.x, h: h + m.y } ); break;
				case "s":  GSUdomSetAttr( this, { w,          h: h + m.y } ); break;
				case "sw": GSUdomSetAttr( this, { w: w - m.x, h: h + m.y, x: x + m.x, y          } ); break;
				case "w":  GSUdomSetAttr( this, { w: w - m.x, h         , x: x + m.x, y          } ); break;
				case "nw": GSUdomSetAttr( this, { w: w - m.x, h: h - m.y, x: x + m.x, y: y + m.y } ); break;
				case "n":  GSUdomSetAttr( this, { w,          h: h - m.y, x,          y: y + m.y } ); break;
				case "ne": GSUdomSetAttr( this, { w: w + m.x, h: h - m.y, x,          y: y + m.y } ); break;
			}
		}
	}

	// .........................................................................
	#calcCSSmagnet( dir, x, y ) {
		const rc = this.#rect;
		const dirW = dir.includes( "w" );
		const dirN = dir.includes( "n" );
		const dirE = dir.includes( "e" );
		const dirS = dir.includes( "s" );
		const tx = dirW ? rc.x + x : rc.x;
		const ty = dirN ? rc.y + y : rc.y;
		const [ w, h ] = GSUdomBCRwh( this.parentNode );
		const wins = [
			...this.parentNode.childNodes,
			{
				dataset: {},
				$getRect: () => ( { x: 0, y: 0, w, h } ),
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
				const wrc = win.$getRect();
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
		const rc = this.#rect;
		const w = rc.w - this.#wMin;
		const h = rc.h - this.#hMin - this.#mousedownHeadHeight;

		switch ( dir ) {
			case "n":
			case "nw":
			case "ne": if ( h - mm.y < 0 ) { mm.y =  h; } else if ( rc.y + mm.y < 0 ) { mm.y = -rc.y; } break;
			case "s":
			case "sw":
			case "se": if ( h + mm.y < 0 ) { mm.y = -h; } break;
		}
		switch ( dir ) {
			case "w":
			case "nw":
			case "sw": if ( w - mm.x < 0 ) { mm.x =  w; } break;
			case "e":
			case "ne":
			case "se": if ( w + mm.x < 0 ) { mm.x = -w; } break;
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

GSUdomDefine( "gsui-window", gsuiWindow );
