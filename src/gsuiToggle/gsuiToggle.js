"use strict";

function gsuiToggle() {
	var root = this._clone(),
		inp = root.querySelector( "input" );

	this.rootElement = root;
	this._circCL = root.querySelector( ".gsui-circle" ).classList;
	this.checked = false;
	root.oncontextmenu = function() { return false; };
	root.onmousedown = this._mousedown.bind( this );
}

gsuiToggle.prototype = {
	check() {
		this._set( true );
	},
	uncheck() {
		this._set( false );
	},
	toggle( b ) {
		this._set( arguments.length ? !!b : !this.checked );
	},

	// private:
	_clone() {
		var div = document.createElement( "div" );

		gsuiToggle.template = gsuiToggle.template || document.getElementById( "gsuiToggle" );
		div.appendChild( document.importNode( gsuiToggle.template.content, true ) );
		return div.removeChild( div.querySelector( "*" ) );
	},
	_set( b, change ) {
		if ( b !== this.checked ) {
			this.checked = b;
			this._circCL.toggle( "gsui-on", b );
			if ( change && this.onchange ) {
				this.onchange( b );
			}
		}
	},
	_mousedown( e ) {
		if ( e.button === 0 ) {
			this._set( !this.checked, true );
		} else if ( e.button === 2 && this.onmousedownright ) {
			this.onmousedownright();
		}
	}
};
