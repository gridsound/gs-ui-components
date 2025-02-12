"use strict";

GSUsetTemplate( "gsui-curves", () => [
	GSUcreateDiv( { class: "gsuiCurves-marks" } ),
	GSUcreateDiv( { class: "gsuiCurves-graph" },
		GSUcreateElementSVG( "svg", { class: "gsuiCurves-svg", preserveAspectRatio: "none" },
			GSUcreateElementSVG( "line", { class: "gsuiCurves-line", "shape-rendering": "crispEdges" } ),
			GSUcreateElementSVG( "g", { class: "gsuiCurves-curves" } ),
		)
	)
] );
