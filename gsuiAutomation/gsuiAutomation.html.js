"use strict";

GSUsetTemplate( "gsui-automation", () => [
	GSUcreateDiv( { class: "gsuiAutomation-in" },
		GSUcreateDiv( { class: "gsuiAutomation-head" },
			GSUcreateIcon( { icon: "target" } ),
			GSUcreateButton( { class: "gsuiAutomation-btnTarget" } ),
			GSUcreateElement( "gsui-duration" ),
		),
		GSUcreateDiv( { class: "gsuiAutomation-body" },
			GSUcreateElement( "gsui-beatlines", { color: "#fff" } ),
		),
	),
] );
