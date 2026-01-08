"use strict";

GSUsetTemplate( "gsui-dotline", () =>
	GSUcreateDiv( { class: "gsuiDotline-padding" },
		GSUcreateElement( "gsui-slider", { type: "linear-y", min: -32, max: 32, step: .01, "mousemove-size": 2000 } ),
		GSUcreateElement( "gsui-dotlinesvg" ),
	)
);
