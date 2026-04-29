"use strict";

$.$setTemplate( "gsui-dotline", () =>
	$.$div( { class: "gsuiDotline-padding" },
		$.$elem( "gsui-slider", { type: "linear-y", min: -32, max: 32, step: .01, "mousemove-size": 2000 } ),
		$.$elem( "gsui-dotlinesvg" ),
	)
);
