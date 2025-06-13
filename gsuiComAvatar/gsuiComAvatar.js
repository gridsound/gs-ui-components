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
		this.$element.onload = () => GSUsetAttribute( this, "loaded", true );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "src" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "src":
				GSUdomRmAttr( this, "loaded" );
				this.$element.src = val || "";
				break;
		}
	}
}

GSUdefineElement( "gsui-com-avatar", gsuiComAvatar );
