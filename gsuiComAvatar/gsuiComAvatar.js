"use strict";

class gsuiComAvatar extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-com-avatar",
			$template: [
				$.$elem( "img", { src: "" } ),
				$.$icon( { icon: "musician" } ),
			],
		} );
		this.$element.$on( "load", () => this.$this.$addAttr( "loaded" ) );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "src" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "src":
				this.$this.$rmAttr( "loaded" );
				this.$element.$prop( "src", val || "" );
				break;
		}
	}
}

GSUdomDefine( "gsui-com-avatar", gsuiComAvatar );
