"use strict";

$.$setTemplate( "gsui-dotlinesvg", () =>
	$.$elem( "svg", { preserveAspectRatio: "none", inert: true },
		$.$elem( "path" ),
	)
);
