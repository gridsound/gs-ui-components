"use strict";

GSUI.$setTemplate( "gsui-curves", () =>
	GSUI.$createElementSVG( "svg", { class: "gsuiCurves-svg", preserveAspectRatio: "none" },
		GSUI.$createElementSVG( "line", { class: "gsuiCurves-line", "shape-rendering": "crispEdges" } ),
		GSUI.$createElementSVG( "g", { class: "gsuiCurves-marks" } ),
		GSUI.$createElementSVG( "g", { class: "gsuiCurves-curves" } ),
	)
);
