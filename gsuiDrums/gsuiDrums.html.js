"use strict";

GSUI.$setTemplate( "gsui-drums-line", () =>
	GSUI.$createElement( "div", { class: "gsuiDrums-line" },
		GSUI.$createElement( "div", { class: "gsuiDrums-lineDrums" },
			GSUI.$createElement( "div", { class: "gsuiDrums-lineIn" } ),
		),
		GSUI.$createElement( "div", { class: "gsuiDrums-lineProps" },
			GSUI.$createElement( "gsui-slidergroup" ),
		),
	)
);
