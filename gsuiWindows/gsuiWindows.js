"use strict";

class gsuiWindows extends HTMLElement {
	#objWindows = {};
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
		this._arrWindows.forEach( win => GSUI.$setAttribute( win, "lowgraphics", b ) );
		this.classList.toggle( "gsuiWindows-lowGraphics", b );
	}
	$createWindow( id ) {
		const win = GSUI.$createElement( "gsui-window" );

		win.dataset.id = id;
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
			const z = +win.style.zIndex || 0;

			this._arrWindows.forEach( win => {
				const zz = +win.style.zIndex || 0;

				if ( zz > z ) {
					win.style.zIndex = zz - 1;
				}
			} );
			win.style.zIndex = this._arrWindows.length - 1;
			this.#focusedWindow = win;
		}
	}
}

Object.freeze( gsuiWindows );
customElements.define( "gsui-windows", gsuiWindows );
