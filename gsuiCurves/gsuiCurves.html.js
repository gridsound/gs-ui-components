"use strict";

$.$setTemplate( "gsui-curves", () => [
	$.$elem( "gsui-curves-marks" ),
	$.$elem( "gsui-curves-graph", null,
		$.$elem( "gsui-analyser-hz" ),
		$.$elem( "svg", { preserveAspectRatio: "none" },
			$.$elem( "line", { "shape-rendering": "crispEdges" } ),
			$.$elem( "g" ),
		),
	),
] );
