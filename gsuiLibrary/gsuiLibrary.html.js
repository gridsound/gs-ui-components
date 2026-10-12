"use strict";

$.$setTemplate( "gsui-library", () => [
	$.$div( { class: "gsuiLibrary-head" } ),
	$.$div( { class: "gsuiLibrary-body" },
		$.$div( { class: "gsuiLibrary-placeholder" }, "no sample here..." ),
	),
] );

$.$setTemplate( "gsui-library-sep", id =>
	$.$div( { class: "gsuiLibrary-sep", "data-id": id, "data-expanded": true },
		$.$button( { tabindex: -1 },
			$.$icon( { icon: "caret-right" } ),
			$.$span( null, id ),
		),
	)
);

$.$setTemplate( "gsui-library-sample", o =>
	$.$elem( "gsui-library-sample", { "data-id": o.id, "data-expanded": true, "data-name": o.name, "data-tooltip": o.name },
		$.$elem( "svg", { viewBox: "0 0 40 10", preserveAspectRatio: "none" },
			$.$elem( "polygon", { points: o.points } ),
		),
	)
);
