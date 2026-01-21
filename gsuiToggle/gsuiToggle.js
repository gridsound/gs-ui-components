"use strict";

class gsuiToggle extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiToggle",
			$tagName: "gsui-toggle",
			$jqueryfy: true,
			$template: GSUcreateIcon( { icon: "hexagon" } ),
			$attributes: { tabindex: 0 },
		} );
		Object.seal( this );
		this.$this.$on( {
			contextmenu: e => e.preventDefault(),
			mousedown: this.#onmousedown.bind( this ),
		} );
	}
	$isOn() {
		return !this.$this.$hasAttr( "off" );
	}
	#onmousedown( e ) {
		if ( e.button === 2 ) {
			this.$this.$dispatch( GSEV_TOGGLE_TOGGLESOLO );
		} else if ( e.button === 0 ) {
			this.$this.$togAttr( "off" ).$dispatch( GSEV_TOGGLE_TOGGLE, this.$isOn() );
		}
	}
}

GSUdomDefine( "gsui-toggle", gsuiToggle );
