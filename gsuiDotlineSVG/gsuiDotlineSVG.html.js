"use strict";

GSUsetTemplate( "gsui-dotlinesvg", () =>
	GSUcreateElementSVG( "svg", { preserveAspectRatio: "none" },
		GSUcreateElementSVG( "path" ),
	)
);
