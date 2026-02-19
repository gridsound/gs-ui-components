"use strict";

GSUsetTemplate( "gsui-wavelet-browser", () => [
	GSUcreateDiv( { class: "gsuiWaveletBrowser-top" },
		GSUcreateDiv( { class: "gsuiWaveletBrowser-list" },
			GSUcreateDiv(),
		),
		GSUcreateDiv( { class: "gsuiWaveletBrowser-svgs", inert: true },
			GSUcreateElement( "gsui-periodicwave" ),
			GSUcreateElement( "gsui-periodicwave" ),
			GSUcreateDiv( { "data-axe": "y" } ),
		),
	),
	GSUcreateButton( null, "Ok" ),
] );
