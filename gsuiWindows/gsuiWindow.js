"use strict";

class gsuiWindow {
	constructor( parent, id ) {
		const root = gsuiWindow.template.cloneNode( true ),
			elWrap = root.querySelector( ".gsuiWindow-wrap" ),
			elHead = root.querySelector( ".gsuiWindow-head" ),
			elIcon = root.querySelector( ".gsuiWindow-icon" ),
			elTitle = root.querySelector( ".gsuiWindow-title" ),
			elContent = root.querySelector( ".gsuiWindow-content" ),
			elHeadBtns = root.querySelector( ".gsuiWindow-headBtns" ),
			elHandlers = root.querySelector( ".gsuiWindow-handlers" ),
			elHeadContent = root.querySelector( ".gsuiWindow-headContent" );

		this.id = id;
		this.parent = parent;
		this._elWrap = elWrap;
		this._elHead = elHead;
		this._elIcon = elIcon;
		this._elTitle = elTitle;
		this._elContent = elContent;
		this._elHandlers = elHandlers;
		this._elHeadContent = elHeadContent;
		this.rootElement = root;
		this._minimized =
		this._maximized = false;
		this.onresize =
		this.onfocusin =
		this.onresizing = null;
		root.dataset.windowId = id;
		root.addEventListener( "focusin", this.parent._onfocusinWin.bind( this.parent, this ) );
		elIcon.ondblclick = this.close.bind( this );
		elHeadBtns.onclick = this._onclickBtns.bind( this );
		elHead.onmousedown = this._onmousedownHead.bind( this );
		elTitle.ondblclick =
		elHeadContent.ondblclick = this._ondblclickTitle.bind( this );
		elHandlers.onmousedown = this._onmousedownHandlers.bind( this );
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
		this._elIcon.dataset.icon = icon;
	}
	empty() {
		while ( this._elContent.lastChild ) {
			this._elContent.lastChild.remove();
		}
		while ( this._elHeadContent.lastChild ) {
			this._elHeadContent.lastChild.remove();
		}
	}
	append( ...args ) {
		Element.prototype.append.apply( this._elContent, args );
	}
	headAppend( ...args ) {
		Element.prototype.append.apply( this._elHeadContent, args );
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

			this.__x = this._x;
			this.__y = this._y;
			this.__w = this._w;
			if ( !this._minimized ) {
				this.__h = this._h;
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
			if ( !this._maximized ) {
				this.__w = this._w;
				this.__h = this._h;
				this.__x = this._x;
				this.__y = this._y;
			}
			this._setClass( "minimized", true );
			this._setClass( "maximized", false );
			this._minimized = true;
			this._maximized = false;
			this.setSize( this.__w, this._getHeadHeight(), "nocallback" );
			this.setPosition( this.__x, this.__y );
			this.parent._winRestored( this.id );
		}
	}
	restore() {
		if ( this._minimized || this._maximized ) {
			this.focus();
			this._setClass( "minimized", false );
			this._setClass( "maximized", false );
			this._minimized =
			this._maximized = false;
			this.setSize( this.__w, this.__h );
			this.setPosition( this.__x, this.__y );
			this.parent._winRestored( this.id );
		}
	}

	movable( b ) {
		this._setClass( "movable", b );
	}
	setTitle( t ) {
		this._elTitle.textContent = t;
	}
	setSize( w, h, nocb ) {
		this._w = w;
		this._h = h;
		this.rootElement.style.width = `${ w }px`;
		this.rootElement.style.height = `${ h }px`;
		if ( nocb !== "nocallback" ) {
			this._callOnresize();
		}
	}
	setPosition( x, y ) {
		this._x = x;
		this._y = y;
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

		if ( clicked ) {
			this._mousedownX = e.clientX;
			this._mousedownY = e.clientY;
			this._setClass( "dragging", true );
			this.parent._startMousemoving( "move",
				this._onmousemoveHead.bind( this ),
				this._onmouseupHead.bind( this ) );
		}
	}
	_onmousedownHandlers( e ) {
		const dir = e.target.dataset.dir;

		if ( dir ) {
			this._mousedownX = e.clientX;
			this._mousedownY = e.clientY;
			this._mousedownHeadHeight = this._getHeadHeight();
			this._setClass( "dragging", true );
			this.parent._startMousemoving( `${ dir }-resize`,
				this._onmousemoveHandler.bind( this, dir ),
				this._onmouseupHandler.bind( this, dir ) );
		}
	}
	_onmousemoveHead( e ) {
		const x = e.clientX - this._mousedownX,
			y = e.clientY - this._mousedownY;

		this._mousemoveX = x;
		this._mousemoveY = y;
		this._setCSSrelativeMove( this._elHandlers.style, x, y );
		if ( !this.parent._lowGraphics ) {
			this._setCSSrelativeMove( this._elWrap.style, x, y );
		}
	}
	_onmouseupHead( e ) {
		const x = this._x,
			y = this._y,
			x_ = e.clientX - this._mousedownX,
			y_ = e.clientY - this._mousedownY;

		this._setClass( "dragging", false );
		this._resetCSSrelative( this._elWrap.style );
		this._resetCSSrelative( this._elHandlers.style );
		if ( x_ || y_ ) {
			this.setPosition( x + x_, y + y_ );
			this.__x = this._x;
			this.__y = this._y;
		}
	}
	_onmousemoveHandler( dir, e ) {
		const fnResize = this.onresizing,
			x = e.clientX - this._mousedownX,
			y = e.clientY - this._mousedownY;

		this._mousemoveX = x;
		this._mousemoveY = y;
		this._setCSSrelativeResize( this._elHandlers.style, dir, x, y );
		if ( !this.parent._lowGraphics ) {
			this._setCSSrelativeResize( this._elWrap.style, dir, x, y );
			if ( fnResize ) {
				const w = this._w,
					h = this._h - this._mousedownHeadHeight;

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
	_onmouseupHandler( dir, e ) {
		const x = this._x,
			y = this._y,
			w = this._w,
			h = this._h,
			x_ = e.clientX - this._mousedownX,
			y_ = e.clientY - this._mousedownY;

		this._setClass( "dragging", false );
		this._resetCSSrelative( this._elWrap.style );
		this._resetCSSrelative( this._elHandlers.style );
		if ( x_ || y_ ) {
			switch ( dir ) {
				case "e" : this.setSize( w + x_, h      ); break;
				case "se": this.setSize( w + x_, h + y_ ); break;
				case "s" : this.setSize( w,      h + y_ ); break;
				case "sw": this.setSize( w - x_, h + y_ ); this.setPosition( x + x_, y      ); break;
				case "w" : this.setSize( w - x_, h      ); this.setPosition( x + x_, y      ); break;
				case "nw": this.setSize( w - x_, h - y_ ); this.setPosition( x + x_, y + y_ ); break;
				case "n" : this.setSize( w,      h - y_ ); this.setPosition( x,      y + y_ ); break;
				case "ne": this.setSize( w + x_, h - y_ ); this.setPosition( x,      y + y_ ); break;
			}
		}
	}

	// private:
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
			const bcr = this._elContent.getBoundingClientRect();

			this.onresize( bcr.width, bcr.height );
		}
	}
	_getHeadHeight() {
		return this._elHead.getBoundingClientRect().height;
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
	_setCSSrelativeResize( st, dir, x, y ) {
		switch ( dir ) {
			case "n" : st.top    = `${  y }px`; break;
			case "w" : st.left   = `${  x }px`; break;
			case "e" : st.right  = `${ -x }px`; break;
			case "s" : st.bottom = `${ -y }px`; break;
			case "nw": st.left   = `${  x }px`; st.top    = `${  y }px`; break;
			case "ne": st.right  = `${ -x }px`; st.top    = `${  y }px`; break;
			case "sw": st.left   = `${  x }px`; st.bottom = `${ -y }px`; break;
			case "se": st.right  = `${ -x }px`; st.bottom = `${ -y }px`; break;
		}
	}
}

gsuiWindow.template = document.querySelector( "#gsuiWindow-template" );
gsuiWindow.template.remove();
gsuiWindow.template.removeAttribute( "id" );
