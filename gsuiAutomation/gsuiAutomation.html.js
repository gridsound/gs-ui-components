"use strict";

GSUsetTemplate( "gsui-automation", () => [
	GSUcreateDiv( { class: "gsuiAutomation-in" },
		GSUcreateDiv( { class: "gsuiAutomation-head" },
			GSUcreateIcon( { icon: "target" } ),
			GSUcreateButton( { class: "gsuiAutomation-btnTarget gsui-ellipsis" } ),
			GSUcreateElement( "gsui-duration" ),
		),
		GSUcreateDiv( { class: "gsuiAutomation-body" },
			GSUcreateElement( "gsui-beatlines", { color: "#fff" } ),
			GSUcreateElement( "gsui-dotline", { viewbox: "0 0 1 1", xstep: .001, ystep: .001 } ),
		),
	),
] );
