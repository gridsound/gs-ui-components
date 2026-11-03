"use strict";

$.$setTemplate( "gsui-libraries", () => [
	$.$elem( "gsui-libraries-head", null,
		$.$icon( { icon: "cu-waveform" } ),
		$.$bold( null, GSTX.$libraries_title ),
		$.$elem( "gsui-libraries-libs", null,
			$.$button( { "data-prop": "default", "data-tooltip": GSTX.$libraries_standDesc }, GSTX.$libraries_stand ),
			$.$button( { "data-prop": "cloud",   "data-tooltip": GSTX.$libraries_cloudDesc }, GSTX.$libraries_cloud ),
			$.$button( { "data-prop": "local",   "data-tooltip": GSTX.$libraries_localDesc }, GSTX.$libraries_local ),
		),
	),
	$.$elem( "gsui-libraries-body", null,
		$.$elem( "gsui-library", { "data-prop": "default" } ),
		$.$elem( "gsui-library", { "data-prop": "cloud" } ),
		$.$elem( "gsui-library", { "data-prop": "local" } ),
	),
] );
