"use strict";

GSUsetTemplate( "gsui-wavelet-browser", () => [
	GSUcreateDiv( { class: "gsuiWaveletBrowser-top" },
		GSUcreateDiv( { class: "gsuiWaveletBrowser-list" },
			GSUcreateDiv(),
		),
		GSUcreateDiv( { class: "gsuiWaveletBrowser-svgs" },
			GSUcreateElement( "gsui-wavelet-svg" ),
			GSUcreateElement( "gsui-wavelet-svg", { axes: true } ),
		),
	),
	GSUcreateButton( null, "Ok" ),
] );
