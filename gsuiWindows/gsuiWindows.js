"use strict";

class gsuiWindows extends HTMLElement {
	#objWindows = {};
	#nbWindowsMaximized = 0;
	#mouseFnUp = null;
	#mouseFnMove = null;
	#focusedWindow = null;

	constructor() {
		super();
		this.onopen =
		this.onclose = null;
		this._arrWindows = [];
		Object.seal( this );
	}

	// .........................................................................
	$setLowGraphics( b ) {
		this._arrWindows.forEach( win => win.$setLowGraphics( b ) );
		this.classList.toggle( "gsuiWindows-lowGraphics", b );
	}
	$createWindow( id ) {
		const win = GSUI.$createElement( "gsui-window" );

		win.$setId( id );
		win.$setParent( this );
		win.addEventListener( "focusin", this.#onfocusinWin.bind( this, win ) );
		this._arrWindows.push( win );
		this.#objWindows[ id ] = win;
		this.append( win );
		return win;
	}
	$window( winId ) {
		return this.#objWindows[ winId ];
	}

	// .........................................................................
	_startMousemoving( cursor, fnMove, fnUp ) {
		this.#mouseFnUp = this.#stopMousemoving.bind( this, fnUp );
		this.#mouseFnMove = fnMove;
		document.addEventListener( "mouseup", this.#mouseFnUp );
		document.addEventListener( "mousemove", fnMove );
		GSUI.$unselectText();
		GSUI.$dragshield.show( cursor );
	}
	#stopMousemoving( fnUp, e ) {
		document.removeEventListener( "mouseup", this.#mouseFnUp );
		document.removeEventListener( "mousemove", this.#mouseFnMove );
		GSUI.$dragshield.hide();
		this.#mouseFnUp =
		this.#mouseFnMove = null;
		fnUp( e );
	}
	_open( win ) {
		this.#onfocusinWin( win );
		this.onopen?.( win );
	}
	_close( win ) {
		if ( win === this.#focusedWindow ) {
			this.#focusedWindow = null;
		}
		this.onclose?.( win );
	}
	#onfocusinWin( win, e ) {
		if ( win !== this.#focusedWindow ) {
			const z = win.$getZIndex();

			this._arrWindows.forEach( win => {
				if ( win.$getZIndex() > z ) {
					win.$setZIndex( win.$getZIndex() - 1 );
				}
			} );
			win.$setZIndex( this._arrWindows.length - 1 );
			this.#focusedWindow = win;
		}
		if ( e && win.onfocusin ) {
			win.onfocusin( e );
		}
	}
	_winMaximized( _winId ) {
		++this.#nbWindowsMaximized;
		this.scrollTop =
		this.scrollLeft = 0;
	}
	_winRestored( _winId ) {
		--this.#nbWindowsMaximized;
	}
}

Object.freeze( gsuiWindows );
customElements.define( "gsui-windows", gsuiWindows );
