"use strict";

GSUI.$setTemplate( "gsui-dotline", () => [
	GSUI.$createElementSVG( "svg", { preserveAspectRatio: "none" },
		GSUI.$createElementSVG( "polyline" ),
	),
] );
