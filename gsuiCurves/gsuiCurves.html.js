"use strict";

GSUsetTemplate( "gsui-curves", () =>
	GSUcreateElementSVG( "svg", { class: "gsuiCurves-svg", preserveAspectRatio: "none" },
		GSUcreateElementSVG( "line", { class: "gsuiCurves-line", "shape-rendering": "crispEdges" } ),
		GSUcreateElementSVG( "g", { class: "gsuiCurves-marks" } ),
		GSUcreateElementSVG( "g", { class: "gsuiCurves-curves" } ),
	)
);
