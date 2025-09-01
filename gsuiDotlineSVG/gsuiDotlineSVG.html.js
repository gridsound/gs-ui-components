"use strict";

GSUsetTemplate( "gsui-dotlinesvg", () =>
	GSUcreateElement( "svg", { preserveAspectRatio: "none", inert: true },
		GSUcreateElement( "path" ),
	)
);
