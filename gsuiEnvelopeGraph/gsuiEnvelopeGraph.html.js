"use strict";

$.$setTemplate( "gsui-envelope-graph", () =>
	$.$elem( "svg", { preserveAspectRatio: "none" },
		$.$elem( "polyline" ),
		$.$elem( "polyline" ),
		$.$elem( "polyline" ),
	)
);
