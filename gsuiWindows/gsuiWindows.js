"use strict";

class gsuiWindows {
	constructor() {
		this._arrWindows = [];
		this._objWindows = {};
		this._nbWindowsMaximized = 0;
		this._lowGraphics = false;
		this.onopen =
		this.onclose =
		this._mouseFnUp =
		this._mouseFnMove =
		this.focusedWindow = null;
		this.setRootElement( document.body );
		Object.seal( this );
	}

	resized() {
		this._arrWindows.forEach( win => {
			if ( win._maximized ) {
				win._callOnresize();
			}
		} );
	}
	lowGraphics( b ) {
		this._lowGraphics = b;
		this.rootElement.classList.toggle( "gsuiWindows-lowGraphics", b );
	}
	setRootElement( el ) {
		if ( el !== this.rootElement ) {
			this._detach();
			this._attachTo( el );
			this._arrWindows.forEach( win => win._attachTo( el ) );
		}
	}
	createWindow( id ) {
		const win = new gsuiWindow( this, id );

		this._arrWindows.push( win );
		this._objWindows[ id ] = win;
		win._attachTo( this.rootElement );
		win.movable( true );
		return win;
	}
	window( winId ) {
		return this._objWindows[ winId ];
	}

	// private and share with gsuiWindow:
	// .........................................................................
	_startMousemoving( cursor, fnMove, fnUp ) {
		window.getSelection().removeAllRanges();
		this._mouseFnUp = this._stopMousemoving.bind( this, fnUp );
		this._mouseFnMove = fnMove;
		document.addEventListener( "mouseup", this._mouseFnUp );
		document.addEventListener( "mousemove", fnMove );
		GSUI.dragshield.show( cursor );
	}
	_stopMousemoving( fnUp, e ) {
		document.removeEventListener( "mouseup", this._mouseFnUp );
		document.removeEventListener( "mousemove", this._mouseFnMove );
		GSUI.dragshield.hide();
		this._mouseFnUp =
		this._mouseFnMove = null;
		fnUp( e );
	}

	// private:
	// .........................................................................
	_detach() {
		const el = this.rootElement;

		if ( el ) {
			el.classList.remove( "gsuiWindows", "gsuiWindows-lowGraphics" );
		}
	}
	_attachTo( el ) {
		this.rootElement = el;
		el.classList.add( "gsuiWindows" );
		el.classList.toggle( "gsuiWindows-lowGraphics", this._lowGraphics );
	}
	_open( win ) {
		win.focus();
		if ( this.onopen ) {
			this.onopen( win );
		}
	}
	_close( win ) {
		if ( win === this.focusedWindow ) {
			this.focusedWindow = null;
		}
		if ( this.onclose ) {
			this.onclose( win );
		}
	}
	_onfocusinWin( win, e ) {
		if ( win !== this.focusedWindow ) {
			const z = win.zIndex;

			clearTimeout( win._focusoutTimeoutId );
			this._arrWindows.forEach( win => {
				if ( win.zIndex > z ) {
					win._setZIndex( win.zIndex - 1 );
				}
			} );
			win._setZIndex( this._arrWindows.length - 1 );
			this.focusedWindow = win;
		}
		if ( win.onfocusin ) {
			win.onfocusin( e );
		}
	}
	_winMaximized( _winId ) {
		++this._nbWindowsMaximized;
		this.rootElement.classList.add( "gsuiWindows-maximized" );
		this.rootElement.scrollTop =
		this.rootElement.scrollLeft = 0;
	}
	_winRestored( _winId ) {
		if ( --this._nbWindowsMaximized === 0 ) {
			this.rootElement.classList.remove( "gsuiWindows-maximized" );
		}
	}
}

Object.freeze( gsuiWindows );
