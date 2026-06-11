"use strict";

$.$setTemplate( "gsui-dotline", () => {
	const popId = GSUuuid();

	return $.$div( { class: "gsuiDotline-padding" },
		$.$elem( "gsui-slider", { type: "linear-y", min: -32, max: 32, step: .01, "mousemove-size": 2000 } ),
		$.$elem( "gsui-dotlinesvg" ),
		$.$div( { class: "gsuiDotline-menu", id: popId, popover: "auto" },
			$.$button( null,
				$.$icon( { icon: "close" } ),
				$.$span( { inert: true }, "delete" ),
			),
			"hold curve doubleCurve stair sineWave triangleWave squareWave".split( " " ).map( s =>
				$.$label( null,
					$.$input( { type: "radio", name: "gsuiDotline-curve", value: s } ),
					$.$span( null, s ),
				)
			),
		),
	);
} );
