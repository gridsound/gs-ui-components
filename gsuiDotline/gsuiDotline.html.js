"use strict";

GSUsetTemplate( "gsui-dotline", () => [
	GSUcreateElementSVG( "svg", { preserveAspectRatio: "none" },
		GSUcreateElementSVG( "polyline" ),
	),
] );
