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
		this.onmousedown = e => {
			if ( e.button === 2 ) {
				this.$dispatch( "toggleSolo" );
			} else if ( e.button === 0 ) {
				const off = GSUdomHasAttr( this, "off" );

				GSUdomSetAttr( this, "off", !off );
				this.$dispatch( "toggle", off );
			}
		};
	}
	$isOn() {
		return !GSUdomHasAttr( this, "off" );
	}
}

GSUdefineElement( "gsui-toggle", gsuiToggle );
