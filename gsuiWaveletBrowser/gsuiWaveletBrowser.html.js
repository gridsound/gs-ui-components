"use strict";

$.$setTemplate( "gsui-wavelet-browser", () => [
	$.$div( { class: "gsuiWaveletBrowser-top" },
		$.$div( { class: "gsuiWaveletBrowser-list" },
			$.$div(),
		),
		$.$div( { class: "gsuiWaveletBrowser-svgs", inert: true },
			$.$elem( "gsui-periodicwave" ),
			$.$elem( "gsui-periodicwave" ),
			$.$div( { "data-axe": "y" } ),
		),
	),
	$.$button( null, "Ok" ),
] );
