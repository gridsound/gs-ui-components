"use strict";

GSUsetTemplate( "gsui-step-select", () => [
	$.$elem( "gsui-toggle", { off: true } ),
	$.$span( { inert: true } ),
	$.$icon( { icon: "magnet" } ),
	$.$div( null,
		$.$div(),
	),
] );
