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
			GSUisStr( o.$data ) && $.$elem( "polygon", { points: o.$data } ),
			GSUisArr( o.$data ) && $.$elem( "path", { d: `M${ o.$data[ 0 ].replaceAll( ",", "L" ) }` } ),
			GSUisArr( o.$data ) && $.$elem( "path", { d: `M${ o.$data[ 1 ].replaceAll( ",", "L" ) }` } ),
		),
	)
);
