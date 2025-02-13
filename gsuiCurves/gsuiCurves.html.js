"use strict";

GSUsetTemplate( "gsui-curves", () => [
	GSUcreateDiv( { class: "gsuiCurves-marks" } ),
	GSUcreateDiv( { class: "gsuiCurves-graph" },
		GSUcreateElement( "gsui-analyser-hz", { bgcolor: "55 55 66" } ),
		GSUcreateElementSVG( "svg", { class: "gsuiCurves-svg", preserveAspectRatio: "none" },
			GSUcreateElementSVG( "line", { class: "gsuiCurves-line", "shape-rendering": "crispEdges" } ),
			GSUcreateElementSVG( "g", { class: "gsuiCurves-curves" } ),
		)
	)
] );
