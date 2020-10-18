"use strict";

GSUI.setTemplate( "gsui-curves", () => (
	GSUI.createElementNS( "svg", { class: "gsuiCurves-svg", preserveAspectRatio: "none" },
		GSUI.createElementNS( "line", { class: "gsuiCurves-line", "shape-rendering": "crispEdges" } ),
		GSUI.createElementNS( "g", { class: "gsuiCurves-marks" } ),
		GSUI.createElementNS( "g", { class: "gsuiCurves-curves" } ),
	)
) );
