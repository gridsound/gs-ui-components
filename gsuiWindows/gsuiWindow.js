"use strict";

class gsuiWindow extends gsui0ne {
	#wMin = 32;
	#hMin = 32;
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
		this.$elements.$headBtns.$on( "click", this.#onclickBtns.bind( this ) );
		this.$elements.$head.$on( "pointerdown", this.#onptrdownHead.bind( this ) );
		this.$elements.$handlers.$on( "pointerdown", this.#onptrdownHandlers.bind( this ) );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "x", "y", "w", "h", "wmin", "hmin", "icon", "name", "show", "minimized", "maximized" ];
	}
	$attributeChanged( prop, val ) {
		const t = this.$this;
		const b = val === "";

		switch ( prop ) {
			case "y": t.$top( this.#rect.y = +val, "px" ); break;
			case "x": t.$left( this.#rect.x = +val, "px" ); break;
			case "w": t.$width( this.#rect.w = +val, "px" ); break;
			case "h": t.$height( this.#rect.h = +val, "px" ); break;
			case "wmin": this.#wMin = +val; break;
			case "hmin": this.#hMin = +val; break;
			case "icon": this.$elements.$icon.$setAttr( "data-icon", val ); break;
			case "name": this.$elements.$name.$text( val ); break;
			case "show":
				if ( !b ) {
					this.$elements.$content.$empty();
				}
				this.$this.$dispatch( b ? GSEV_WINDOW_OPEN : GSEV_WINDOW_CLOSE );
				break;
			case "minimized":
				if ( b ) {
					this.$elements.$content.$empty();
					t.$rmAttr( "maximized" ).$dispatch( GSEV_WINDOW_CLOSE );
				}
				break;
			case "maximized":
				if ( b ) {
					if ( t.$hasAttr( "minimized" ) ) {
						t.$rmAttr( "minimized" ).$dispatch( GSEV_WINDOW_OPEN );
					}
					t.$focus();
				}
				break;
		}
		switch ( prop ) {
			case "minimized":
			case "maximized":
				if ( !t.$hasAttr( "minimized" ) && !t.$hasAttr( "maximized" ) ) {
					if ( prop === "minimized" ) {
						t.$dispatch( GSEV_WINDOW_OPEN );
					}
					t.$focus();
				}
				break;
		}
	}
	$onmessage( ev, ...args ) {
		switch ( ev ) {
			case GSEV_WINDOW_APPENDHEAD: this.$elements.$headContent.$append( ...args ); break;
			case GSEV_WINDOW_APPENDCONTENT: this.$elements.$content.$append( ...args ); break;
		}
	}

	// .........................................................................
	#onclickBtns( e ) {
		switch ( e.target.dataset.action ) {
			case "minimize": this.$this.$addAttr( "minimized" ); break;
			case "maximize": this.$this.$addAttr( "maximized" ); break;
			case "restore": this.$this.$rmAttr( "minimized", "maximized" ); break;
			case "close": this.$this.$rmAttr( "show" ); break;
		}
	}
	#onptrdownHead( e ) {
		const tar = $( e.target );
		const clicked =
			tar.$hasClass( "gsuiWindow-head" ) ||
			tar.$hasClass( "gsuiWindow-icon" ) ||
			tar.$hasClass( "gsuiWindow-name" ) ||
			tar.$hasClass( "gsuiWindow-headContent" );

		if ( GSUdomIsDblClick( e ) ) {
			this.$this.$togAttr( "maximized" );
		} else if ( e.button === 0 && clicked && !this.$this.$hasAttr( "maximized" ) ) {
			this.#mousedownPos.x = e.clientX;
			this.#mousedownPos.y = e.clientY;
			this.#mousemovePos.x =
			this.#mousemovePos.y = 0;
			this.setPointerCapture( e.pointerId );
			GSUdomUnselect();
			this.$this.$addAttr( "dragging" ).$css( "cursor", "move" );
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
			this.$this.$addAttr( "dragging" ).$css( "cursor", `${ dir }-resize` );
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
		this.#setCSSrelativeMove( this.$elements.$handlers, mmPos );
		if ( !GSUdomHasAttr( this.parentNode, "lowgraphics" ) ) {
			this.#setCSSrelativeMove( this.$elements.$wrap, mmPos );
		}
	}
	#onptrupHead( e ) {
		const { x, y } = this.#rect;
		const m = this.#mousemovePos;

		this.onpointermove =
		this.onpointerup = null;
		this.releasePointerCapture( e.pointerId );
		this.$this.$rmAttr( "dragging" ).$css( "cursor", "" );
		this.$elements.$wrap.$css( this.#resetCSS );
		this.$elements.$handlers.$css( this.#resetCSS );
		if ( m.x || m.y ) {
			this.$this.$setAttr( {
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
		this.#setCSSrelativeResize( this.$elements.$handlers, dir, mmPos );
		if ( !GSUdomHasAttr( this.parentNode, "lowgraphics" ) ) {
			this.#setCSSrelativeResize( this.$elements.$wrap, dir, mmPos );
		}
	}
	#onptrupHandler( dir, e ) {
		const { x, y, w, h } = this.#rect;
		const m = this.#mousemovePos;

		this.onpointermove =
		this.onpointerup = null;
		this.releasePointerCapture( e.pointerId );
		this.$this.$rmAttr( "dragging" ).$css( "cursor", "" );
		this.$elements.$wrap.$css( this.#resetCSS );
		this.$elements.$handlers.$css( this.#resetCSS );
		if ( m.x || m.y ) {
			switch ( dir ) {
				case "e":  this.$this.$setAttr( { w: w + m.x, h          } ); break;
				case "se": this.$this.$setAttr( { w: w + m.x, h: h + m.y } ); break;
				case "s":  this.$this.$setAttr( { w,          h: h + m.y } ); break;
				case "sw": this.$this.$setAttr( { w: w - m.x, h: h + m.y, x: x + m.x, y          } ); break;
				case "w":  this.$this.$setAttr( { w: w - m.x, h,          x: x + m.x, y          } ); break;
				case "nw": this.$this.$setAttr( { w: w - m.x, h: h - m.y, x: x + m.x, y: y + m.y } ); break;
				case "n":  this.$this.$setAttr( { w,          h: h - m.y, x,          y: y + m.y } ); break;
				case "ne": this.$this.$setAttr( { w: w + m.x, h: h - m.y, x,          y: y + m.y } ); break;
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
		const { w, h } = this.$this.$parent().$bcr();
		const wins = [
			...[ ...this.parentNode.childNodes ].map( w => ( {
				$id: w.dataset.id,
				$bcr: w.#rect,
				$open: $( w ).$hasAttr( "show" ),
			} ) ),
			{
				$bcr: { x: 0, y: 0, w, h },
				$open: true,
			},
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
			if ( win.$open && this.dataset.id !== win.$id ) {
				const wrcDir = win.$bcr[ dir ];
				const v1 = wrcDir - brdL - value;
				const v2 = wrcDir + ( dir === "x" ? win.$bcr.w : win.$bcr.h ) + brdR - value;
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
	#setCSSrelativeMove( el, p ) {
		const top = parseFloat( this.style.top );
		const left = parseFloat( this.style.left );
		const minX = -left - this.clientWidth + ( 3 * 24 + 10 );
		const minY = -top;
		const maxX = this.parentNode.clientWidth - left - 24 - 10;
		const maxY = this.parentNode.clientHeight - top - 24;

		p.y = Math.max( minY, Math.min( p.y, maxY ) );
		p.x = Math.max( minX, Math.min( p.x, maxX ) );
		el.$css( {
			top:    `${  p.y }px`,
			left:   `${  p.x }px`,
			right:  `${ -p.x }px`,
			bottom: `${ -p.y }px`,
		} );
	}
	#calcCSSrelativeResize( dir, mm ) {
		const rc = this.#rect;
		const w = rc.w - this.#wMin;
		const h = rc.h - this.#hMin - this.#mousedownHeadHeight;

		switch ( dir ) {
			case "n":
			case "nw":
			case "ne":
				if ( h - mm.y < 0 ) {
					mm.y =  h;
				} else if ( rc.y + mm.y < 0 ) {
					mm.y = -rc.y;
				}
				break;
			case "s":
			case "sw":
			case "se":
				if ( h + mm.y < 0 ) {
					mm.y = -h;
				}
				break;
		}
		switch ( dir ) {
			case "w":
			case "nw":
			case "sw":
				if ( w - mm.x < 0 ) {
					mm.x =  w;
				}
				break;
			case "e":
			case "ne":
			case "se":
				if ( w + mm.x < 0 ) {
					mm.x = -w;
				}
				break;
		}
	}
	#setCSSrelativeResize( el, dir, mm ) {
		switch ( dir ) {
			case "n":  el.$css( "top",     mm.y, "px" ); break;
			case "s":  el.$css( "bottom", -mm.y, "px" ); break;
			case "w":  el.$css( "left",    mm.x, "px" ); break;
			case "e":  el.$css( "right",  -mm.x, "px" ); break;
			case "nw": el.$css( "left",    mm.x, "px" ); el.$css( "top",     mm.y, "px" ); break;
			case "ne": el.$css( "right",  -mm.x, "px" ); el.$css( "top",     mm.y, "px" ); break;
			case "sw": el.$css( "left",    mm.x, "px" ); el.$css( "bottom", -mm.y, "px" ); break;
			case "se": el.$css( "right",  -mm.x, "px" ); el.$css( "bottom", -mm.y, "px" ); break;
		}
	}
}

GSUdomDefine( "gsui-window", gsuiWindow );
