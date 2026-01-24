"use strict";

class gsuiHelpLink extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiHelpLink",
			$tagName: "gsui-help-link",
			$template: GSUcreateAExt( { class: "gsuiIcon", "data-icon": "info" } ),
		} );
		Object.seal( this );
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

GSUdomDefine( "gsui-help-link", gsuiHelpLink );
