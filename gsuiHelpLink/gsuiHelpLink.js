"use strict";

class gsuiHelpLink extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-help-link",
			$template: $.$linkExt( null,
				$.$icon( { icon: "help" } ),
			),
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "page" ];
	}
	$attributeChanged( prop, val ) {
		if ( prop === "page" ) {
			this.$element.$setAttr( {
				href: `${ GSURL.$wiki }/help-${ val }`,
				"data-tooltip": GSTXreplace( GSTX.$helpLink_open, val ),
			} );
		}
	}
}

$.$define( "gsui-help-link", gsuiHelpLink );
