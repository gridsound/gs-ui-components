"use strict";

$.$setTemplate( "gsui-dragline", () =>
	$.$div( { class: "gsuiDragline-main" },
		$.$elem( "svg", { class: "gsuiDragline-line" },
			$.$elem( "polyline" ),
		),
		$.$div( { class: "gsuiDragline-to" } ),
	),
);
