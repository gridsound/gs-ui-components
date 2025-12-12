"use strict";

GSUsetTemplate( "gsui-effect", () => [
	GSUcreateDiv( { class: "gsuiEffect-head" },
		GSUcreateDiv( { class: "gsuiEffect-grip gsuiIcon", "data-icon": "grip-v" } ),
		GSUcreateButton( { class: "gsuiEffect-expand", icon: "caret-right" } ),
		GSUcreateElement( "gsui-toggle", { off: true, title: "Toggle this effect" } ),
		GSUcreateSpan( { class: "gsuiEffect-name", inert: true } ),
		GSUcreateElement( "gsui-help-link" ),
		GSUcreateButton( { class: "gsuiEffect-remove", icon: "close", title: "Delete this effect" } ),
	),
	GSUcreateDiv( { class: "gsuiEffect-content" } ),
] );
