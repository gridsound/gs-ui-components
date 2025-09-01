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
			GSUdomDispatch( this, GSEV_TOGGLE_TOGGLESOLO );
		} else if ( e.button === 0 ) {
			GSUdomTogAttr( this, "off" );
			GSUdomDispatch( this, GSEV_TOGGLE_TOGGLE, this.$isOn() );
		}
	}
}

GSUdomDefine( "gsui-toggle", gsuiToggle );
