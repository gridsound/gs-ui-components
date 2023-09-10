"use strict";

GSUsetTemplate( "gsui-drumrows", () => [
	GSUcreateDiv( { class: "gsuiDrumrows-drop" },
		GSUcreateDiv( { class: "gsuiDrumrows-dropIn" },
			GSUcreateI( { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
			GSUcreateI( { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
			GSUcreateI( { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
		),
	),
] );
