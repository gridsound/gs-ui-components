"use strict";

class gsuiHelpLink extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-help-link",
			$template: $.$linkExt( { class: "gsuiIcon", "data-icon": "help" } ),
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
				"data-tooltip": `Open the <b>${ val }</b> help page`,
			} );
		}
	}
}

$.$define( "gsui-help-link", gsuiHelpLink );
