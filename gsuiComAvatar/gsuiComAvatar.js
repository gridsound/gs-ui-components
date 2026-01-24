"use strict";

class gsuiComAvatar extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiComAvatar",
			$tagName: "gsui-com-avatar",
			$template: [
				GSUcreateElement( "img", { src: "" } ),
				GSUcreateIcon( { icon: "musician" } ),
			],
		} );
		Object.seal( this );
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
