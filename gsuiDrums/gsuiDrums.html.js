"use strict";

GSUsetTemplate( "gsui-drums-line", () =>
	GSUcreateElement( "div", { class: "gsuiDrums-line" },
		GSUcreateElement( "div", { class: "gsuiDrums-lineDrums" },
			GSUcreateElement( "div", { class: "gsuiDrums-lineIn" } ),
		),
		GSUcreateElement( "div", { class: "gsuiDrums-lineProps" },
			GSUcreateElement( "gsui-slidergroup" ),
		),
	)
);
