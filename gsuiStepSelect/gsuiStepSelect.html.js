"use strict";

GSUsetTemplate( "gsui-step-select", () => [
	GSUcreateElement( "gsui-toggle", { off: true } ),
	GSUcreateSpan( { inert: true } ),
	GSUcreateIcon( { icon: "magnet" } ),
	GSUcreateDiv( null,
		GSUcreateDiv(),
	),
] );
