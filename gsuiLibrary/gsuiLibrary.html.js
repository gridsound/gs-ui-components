"use strict";

$.$setTemplate( "gsui-library", () => [
	$.$elem( "gsui-library-body", null,
		$.$elem( "gsui-library-placeholder", null, "..." ),
	),
] );

$.$setTemplate( "gsui-library-sep", id =>
	$.$elem( "gsui-library-sep", { "data-id": id, expanded: true },
		$.$button( { tabindex: -1 },
			$.$icon( { icon: "caret-right" } ),
			$.$span( null, id ),
		),
	)
);

$.$setTemplate( "gsui-library-sample", o =>
	$.$elem( "gsui-library-sample", { "data-id": o.$id, expanded: true, name: o.$name, "data-tooltip": o.$name },
		$.$elem( "svg", { viewBox: "0 0 40 10", preserveAspectRatio: "none" },
			$.$elem( "polygon", { points: o.$points } ),
		),
	)
);
