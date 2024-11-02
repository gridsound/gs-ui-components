"use strict";

class gsuiComAvatar extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiComAvatar",
			$tagName: "gsui-com-avatar",
			$template: [
				GSUcreateElement( "img", { src: "" } ),
				GSUcreateI( { class: "gsuiIcon", "data-icon": "musician", inert: true } ),
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
				GSUsetAttribute( this, "loaded", false );
				this.$element.src = val || "";
				break;
		}
	}
}

GSUdefineElement( "gsui-com-avatar", gsuiComAvatar );
