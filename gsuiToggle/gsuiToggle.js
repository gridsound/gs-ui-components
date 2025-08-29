"use strict";

class gsuiToggle extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiToggle",
			$tagName: "gsui-toggle",
			$template: GSUcreateIcon( { icon: "hexagon" } ),
			$attributes: { tabindex: 0 },
		} );
		Object.seal( this );
		this.oncontextmenu = GSUnoopFalse;
		this.onmousedown = this.#onmousedown.bind( this );
	}
	$isOn() {
		return !GSUdomHasAttr( this, "off" );
	}
	#onmousedown( e ) {
		if ( e.button === 2 ) {
			this.$dispatch( "toggleSolo" );
		} else if ( e.button === 0 ) {
			GSUdomTogAttr( this, "off" );
			this.$dispatch( "toggle", this.$isOn() );
		}
	}
}

GSUdefineElement( "gsui-toggle", gsuiToggle );
