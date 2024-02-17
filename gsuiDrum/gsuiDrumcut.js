"use strict";

class gsuiDrumcut extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiDrumcut",
			$tagName: "gsui-drumcut",
		} );
		Object.seal( this );
	}

	static get observedAttributes() {
		return [ "when", "duration" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "when":
				this.style.left = `${ val }em`;
				break;
			case "duration":
				this.style.width = `${ val }em`;
				break;
		}
	}
}

Object.freeze( gsuiDrumcut );
customElements.define( "gsui-drumcut", gsuiDrumcut );
