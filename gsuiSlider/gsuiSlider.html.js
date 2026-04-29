"use strict";

GSUsetTemplate( "gsui-slider", () => [
	$.$div( { class: "gsuiSlider-line" },
		$.$div( { class: "gsuiSlider-lineColor" } ),
	),
	$.$elem( "svg", { class: "gsuiSlider-svg" },
		$.$elem( "circle", { class: "gsuiSlider-svgLine" } ),
		$.$elem( "circle", { class: "gsuiSlider-svgLineColor" } ),
	),
	$.$div( { class: "gsuiSlider-eventCatcher" } ),
] );
