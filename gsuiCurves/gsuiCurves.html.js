"use strict";

GSUI.setTemplate( "gsui-curves", () =>
	GSUI.createElemSVG( "svg", { class: "gsuiCurves-svg", preserveAspectRatio: "none" },
		GSUI.createElemSVG( "line", { class: "gsuiCurves-line", "shape-rendering": "crispEdges" } ),
		GSUI.createElemSVG( "g", { class: "gsuiCurves-marks" } ),
		GSUI.createElemSVG( "g", { class: "gsuiCurves-curves" } ),
	)
);
