"use strict";

$.$setTemplate( "gsui-automation", () => [
	$.$div( { class: "gsuiAutomation-in" },
		$.$div( { class: "gsuiAutomation-head" },
			$.$icon( { icon: "target" } ),
			$.$button( { class: "gsuiAutomation-btnTarget gsui-ellipsis", title: "Select automation's target" } ),
			$.$elem( "gsui-duration", { max: 64 } ),
		),
		$.$div( { class: "gsuiAutomation-body" },
			$.$elem( "gsui-beatlines", { color: "#fff" } ),
			$.$elem( "gsui-dotline", { viewbox: "0 0 1 1", xstep: .001, ystep: .001 } ),
		),
	),
] );
