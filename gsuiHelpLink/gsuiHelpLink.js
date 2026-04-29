"use strict";

class gsuiHelpLink extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-help-link",
			$template: $.$linkExt( { class: "gsuiIcon", "data-icon": "info" } ),
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "page" ];
	}
	$attributeChanged( prop, val ) {
		if ( prop === "page" ) {
			this.$element.$setAttr( {
				href: `https://github.com/gridsound/daw/wiki/help-${ val }`,
				title: `Open the ${ val } help page`,
			} );
		}
	}
}

$.$define( "gsui-help-link", gsuiHelpLink );
