"use strict";

$.$setTemplate( "gsui-curves", () => [
	$.$div( { class: "gsuiCurves-marks" } ),
	$.$div( { class: "gsuiCurves-graph" },
		$.$elem( "gsui-analyser-hz" ),
		$.$elem( "svg", { class: "gsuiCurves-svg", preserveAspectRatio: "none" },
			$.$elem( "line", { class: "gsuiCurves-line", "shape-rendering": "crispEdges" } ),
			$.$elem( "g", { class: "gsuiCurves-curves" } ),
		),
	),
] );
