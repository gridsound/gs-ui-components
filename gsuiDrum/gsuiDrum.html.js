"use strict";

$.$setTemplate( "gsui-drum", () =>
	$.$div( { class: "gsuiDrum-in", inert: true },
		[ "detune", "pan", "gain" ].map( p =>
			$.$div( { class: "gsuiDrum-prop", "data-value": p },
				$.$div( { class: "gsuiDrum-propValue" } ),
			)
		),
	)
);

$.$setTemplate( "gsui-drumcut", () =>
	$.$div( { class: "gsuiDrumcut-in", inert: true },
		$.$icon( { icon: "drumcut" } ),
	)
);
