"use strict";

GSUsetTemplate( "gsui-effect", () => [
	GSUcreateDiv( { class: "gsuiEffect-head" },
		GSUcreateDiv( { class: "gsuiEffect-grip gsuiIcon", "data-icon": "grip-v" } ),
		GSUcreateButton( { class: "gsuiEffect-expand gsuiIcon", "data-icon": "caret-right" } ),
		GSUcreateElement( "gsui-toggle", { title: "Toggle this effect" } ),
		GSUcreateSpan( { class: "gsuiEffect-name" } ),
		GSUcreateButton( { class: "gsuiEffect-remove gsuiIcon", "data-icon": "close", title: "Delete this effect" } ),
	),
	GSUcreateDiv( { class: "gsuiEffect-content" } ),
] );
