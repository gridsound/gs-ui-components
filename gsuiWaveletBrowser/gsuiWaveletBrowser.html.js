"use strict";

GSUsetTemplate( "gsui-wavelet-browser", () =>
	GSUcreateDiv( { class: "gsuiWaveletBrowser-in" },
		GSUcreateDiv( { class: "gsuiWaveletBrowser-list" },
			GSUcreateDiv(),
		),
		GSUcreateElement( "gsui-wavelet-svg" ),
	),
);
