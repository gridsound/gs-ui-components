"use strict";

$.$setTemplate( "gsui-drums-line", () =>
	$.$div( { class: "gsuiDrums-line" },
		$.$div( { class: "gsuiDrums-lineDrums" },
			$.$div( { class: "gsuiDrums-lineIn" } ),
		),
		$.$div( { class: "gsuiDrums-lineProps" },
			$.$elem( "gsui-slidergroup" ),
		),
	)
);
