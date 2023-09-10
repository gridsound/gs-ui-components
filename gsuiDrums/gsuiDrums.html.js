"use strict";

GSUsetTemplate( "gsui-drums-line", () =>
	GSUcreateDiv( { class: "gsuiDrums-line" },
		GSUcreateDiv( { class: "gsuiDrums-lineDrums" },
			GSUcreateDiv( { class: "gsuiDrums-lineIn" } ),
		),
		GSUcreateDiv( { class: "gsuiDrums-lineProps" },
			GSUcreateElement( "gsui-slidergroup" ),
		),
	)
);
