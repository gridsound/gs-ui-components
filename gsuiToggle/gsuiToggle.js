"use strict";

class gsuiToggle extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-toggle",
			$template: $.$icon( { icon: "hexagon" } ),
			$attributes: { tabindex: 0 },
		} );
		this.$on( {
			contextmenu: e => e.preventDefault(),
			mousedown: this.#onmousedown.bind( this ),
		} );
	}
	$isOn() {
		return !this.$hasAttr( "off" );
	}
	#onmousedown( e ) {
		if ( e.button === 2 ) {
			this.$dispatch( GSEV_TOGGLE_TOGGLESOLO );
		} else if ( e.button === 0 ) {
			this.$togAttr( "off" ).$dispatch( GSEV_TOGGLE_TOGGLE, this.$isOn() );
		}
	}
}

$.$define( "gsui-toggle", gsuiToggle );
