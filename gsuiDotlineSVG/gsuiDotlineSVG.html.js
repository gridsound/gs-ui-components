"use strict";

GSUsetTemplate( "gsui-dotlinesvg", () =>
	$.$elem( "svg", { preserveAspectRatio: "none", inert: true },
		$.$elem( "path" ),
	)
);
