"use strict";

GSUsetTemplate( "gsui-dotlinesvg", () =>
	GSUcreateElementSVG( "svg", { preserveAspectRatio: "none", inert: true },
		GSUcreateElementSVG( "path" ),
	)
);
