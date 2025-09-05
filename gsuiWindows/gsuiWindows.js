"use strict";

class gsuiWindows extends gsui0ne {
	#elWindows = {};
	#focusedWindow = null;

	constructor() {
		super( {
			$cmpName: "gsuiWindows",
			$tagName: "gsui-windows",
		} );
		Object.seal( this );
		GSUdomListen( this, {
			[ GSEV_WINDOW_OPEN ]: d => this.#onopen( d.$target ),
			[ GSEV_WINDOW_CLOSE ]: d => this.#onclose( d.$target ),
			[ GSEV_WINDOW_STARTMOUSEMOVING ]: d => this.#startMousemoving( ...d.$args ),
		} );
		this.onpointerleave = e => this.onpointerup?.( e );
	}

	// .........................................................................
	$createWindow( id ) {
		const win = GSUcreateElement( "gsui-window", { "data-id": id } );

		win.addEventListener( "focusin", this.#onfocusinWin.bind( this, win ) );
		this.#elWindows[ id ] = win;
		this.append( win );
		return win;
	}
	$window( winId ) {
		return this.#elWindows[ winId ];
	}

	// .........................................................................
	#startMousemoving( cursor, ptrId, fnMove, fnUp ) {
		GSUdomUnselect();
		this.setPointerCapture( ptrId );
		this.onpointerup = this.#stopMousemoving.bind( this, fnUp );
		this.onpointermove = fnMove;
		this.style.cursor = cursor;
	}
	#stopMousemoving( fnUp, e ) {
		this.releasePointerCapture( e.pointerId );
		this.onpointerup =
		this.onpointermove = null;
		this.style.cursor = "";
		fnUp( e );
	}
	#onopen( win ) {
		this.#onfocusinWin( win );
		GSUdomDispatch( this, GSEV_WINDOWS_OPEN, win );
	}
	#onclose( win ) {
		if ( win === this.#focusedWindow ) {
			this.#focusedWindow = null;
		}
		GSUdomDispatch( this, GSEV_WINDOWS_CLOSE, win );
	}
	#onfocusinWin( win ) {
		if ( win !== this.#focusedWindow ) {
			const z = +win.style.zIndex || 0;

			this.childNodes.forEach( win => {
				const zz = +win.style.zIndex || 0;

				if ( zz > z ) {
					win.style.zIndex = zz - 1;
				}
			} );
			win.style.zIndex = this.childElementCount - 1;
			this.#focusedWindow = win;
			GSUdomDispatch( this, GSEV_WINDOWS_FOCUS, win.dataset.id );
		}
	}
}

GSUdomDefine( "gsui-windows", gsuiWindows );
