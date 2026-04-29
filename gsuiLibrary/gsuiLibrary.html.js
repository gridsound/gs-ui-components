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

$.$setTemplate( "gsui-library-sample", obj =>
	$.$div( { class: "gsuiLibrary-sample", "data-id": obj.id, "data-expanded": true, "data-name": obj.name, title: obj.name },
		$.$div( { class: "gsuiLibrary-sample-wave", inert: true },
			$.$elem( "svg", { class: "gsuiLibrary-sample-svg", viewBox: "0 0 40 10", preserveAspectRatio: "none" },
				$.$elem( "polygon", { class: "gsuiLibrary-sample-poly", points: obj.points } ),
			),
		),
	)
);
