"use strict";

class gsuiAutomation extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-automation",
			$elements: {
				$xxx: ".gsuiAutomation-xxx",
			},
			// $attributes: {
			// },
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "xxx" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "xxx":
				// ...
				break;
		}
	}
	$onmessage( ev, val ) {
		switch ( ev ) {
			// case GSEV_AUTOMATION_XXX:
			// 	break;
		}
	}

	// .........................................................................
}

GSUdomDefine( "gsui-automation", gsuiAutomation );
