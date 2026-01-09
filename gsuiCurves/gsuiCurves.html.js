"use strict";

GSUsetTemplate( "gsui-curves", () => [
	GSUcreateDiv( { class: "gsuiCurves-marks" } ),
	GSUcreateDiv( { class: "gsuiCurves-graph" },
		GSUcreateElement( "gsui-analyser-hz" ),
		GSUcreateElement( "svg", { class: "gsuiCurves-svg", preserveAspectRatio: "none" },
			GSUcreateElement( "line", { class: "gsuiCurves-line", "shape-rendering": "crispEdges" } ),
			GSUcreateElement( "g", { class: "gsuiCurves-curves" } ),
		),
	),
] );
