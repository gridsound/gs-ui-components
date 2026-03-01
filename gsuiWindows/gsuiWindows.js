"use strict";

class gsuiWindows extends gsui0ne {
	#focusedWindow = $noop;

	constructor() {
		super( {
			$cmpName: "gsuiWindows",
			$tagName: "gsui-windows",
		} );
		Object.seal( this );
		GSUdomListen( this, {
			[ GSEV_WINDOW_OPEN ]: d => this.#onopen( $( d.$target ) ),
			[ GSEV_WINDOW_CLOSE ]: d => this.#onclose( $( d.$target ) ),
		} );
		this.onpointerleave = e => this.onpointerup?.( e );
	}

	// .........................................................................
	$onmessage( ev, val ) {
		switch ( ev ) {
			case GSEV_WINDOWS_GET: return this.$this.$query( `gsui-window[data-id="${ val }"]` );
			case GSEV_WINDOWS_CREATE: return $( "<gsui-window>" )
				.$setAttr( { "data-id": val } )
				.$on( "focusin", this.#onfocusinWin.bind( this ) )
				.$appendTo( this );
		}
	}

	// .........................................................................
	#onopen( win ) {
		this.#recalcZIndexes( win );
		this.$this.$dispatch( GSEV_WINDOWS_OPEN, win );
	}
	#onclose( win ) {
		if ( win.$is( this.#focusedWindow ) ) {
			this.#focusedWindow = $noop;
		}
		this.$this.$dispatch( GSEV_WINDOWS_CLOSE, win );
	}
	#onfocusinWin( e ) {
		this.#recalcZIndexes( $( e.currentTarget ) );
	}
	#recalcZIndexes( win ) {
		if ( !win.$is( this.#focusedWindow ) ) {
			const z = +win.$css( "zIndex" ) || 0;

			this.childNodes.forEach( win => {
				const zz = +win.style.zIndex || 0;

				if ( zz > z ) {
					win.style.zIndex = zz - 1;
				}
			} );
			this.#focusedWindow = win.$css( "zIndex", this.childElementCount - 1 );
			this.$this.$dispatch( GSEV_WINDOWS_FOCUS, win.$getAttr( "data-id" ) );
		}
	}
}

GSUdomDefine( "gsui-windows", gsuiWindows );
