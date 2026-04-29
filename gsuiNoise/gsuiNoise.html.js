"use strict";

$.$setTemplate( "gsui-noise", () => [
	$.$div( { class: "gsuiNoise-type" },
		$.$div( { class: "gsuiNoise-type-color" } ),
		$.$span( { class: "gsuiNoise-type-txt" }, "white" ),
		$.$select( { class: "gsuiNoise-type-select" },
			$.$option( { value: "white" } ),
			$.$option( { value: "pink" } ),
			$.$option( { value: "brown" } ),
		),
	),
	$.$elem( "gsui-slider", { "data-prop": "gain", type: "linear-x", min: 0, max: 1, step: .005, "mousemove-size": 400 } ),
	$.$span( { class: "gsuiNoise-value", "data-prop": "gain" } ),
	$.$span( null, "pan" ),
	$.$elem( "gsui-slider", { "data-prop": "pan", type: "linear-x", min: -1, max: 1, step: .01, "mousemove-size": 400, defaultValue: 0 } ),
	$.$span( { class: "gsuiNoise-value", "data-prop": "pan" } ),
] );
