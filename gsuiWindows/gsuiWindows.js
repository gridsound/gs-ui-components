"use strict";

class gsuiWindows extends gsui0ne {
	#objWindows = {};
	#focusedWindow = null;

	constructor() {
		super( {
			$cmpName: "gsuiWindows",
			$tagName: "gsui-windows",
		} );
		Object.seal( this );
		GSUlistenEvents( this, {
			gsuiWindow: {
				open: ( d, win ) => this.#onopen( win ),
				close: ( d, win ) => this.#onclose( win ),
				startMousemoving: d => this.#startMousemoving( ...d.args ),
			},
		} );
		this.onpointerleave = e => this.onpointerup?.( e );
	}

	// .........................................................................
	$createWindow( id ) {
		const win = GSUcreateElement( "gsui-window", { "data-id": id } );

		win.addEventListener( "focusin", this.#onfocusinWin.bind( this, win ) );
		this.#objWindows[ id ] = win;
		this.append( win );
		return win;
	}
	$window( winId ) {
		return this.#objWindows[ winId ];
	}

	// .........................................................................
	#startMousemoving( cursor, ptrId, fnMove, fnUp ) {
		GSUunselectText();
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
		this.$dispatch( "open", win );
	}
	#onclose( win ) {
		if ( win === this.#focusedWindow ) {
			this.#focusedWindow = null;
		}
		this.$dispatch( "close", win );
	}
	#onfocusinWin( win, e ) {
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
		}
	}
}

Object.freeze( gsuiWindows );
customElements.define( "gsui-windows", gsuiWindows );
