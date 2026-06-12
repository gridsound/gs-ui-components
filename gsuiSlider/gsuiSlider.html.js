"use strict";

$.$setTemplate( "gsui-slider", () => [
	$.$elem( "gsui-slider-line", null,
		$.$div(),
	),
	$.$elem( "svg", null,
		$.$elem( "circle" ),
		$.$elem( "circle" ),
	),
	$.$elem( "gsui-slider-event-catcher" ),
] );
