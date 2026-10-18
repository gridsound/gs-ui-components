"use strict";

$.$setTemplate( "gsui-libraries", () => [
	$.$elem( "gsui-libraries-head", null,
		$.$icon( { icon: "cu-waveform" } ),
		$.$bold( null, "library" ),
		$.$elem( "gsui-libraries-libs", null,
			$.$button( { "data-prop": "default" }, "default" ),
			$.$button( { "data-prop": "local" }, "local" ),
		),
	),
	$.$elem( "gsui-libraries-body", null,
		$.$elem( "gsui-library", { "data-prop": "default" } ),
		$.$elem( "gsui-library", { "data-prop": "local" } ),
	),
] );
