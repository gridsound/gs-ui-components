"use strict";

GSUsetTemplate( "gsui-drumrows", () => [
	GSUcreateElement( "div", { class: "gsuiDrumrows-drop" },
		GSUcreateElement( "div", { class: "gsuiDrumrows-dropIn" },
			GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
			GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
			GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
		),
	),
] );
