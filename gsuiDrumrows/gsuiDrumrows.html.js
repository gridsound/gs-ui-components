"use strict";

GSUI.$setTemplate( "gsui-drumrows", () => [
	GSUI.$createElement( "div", { class: "gsuiDrumrows-drop" },
		GSUI.$createElement( "div", { class: "gsuiDrumrows-dropIn" },
			GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
			GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
			GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
		),
	),
] );
