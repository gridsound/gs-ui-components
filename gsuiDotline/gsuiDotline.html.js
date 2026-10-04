"use strict";

$.$setTemplate( "gsui-dotline", () => {
	const popId = GSUuuid();

	return $.$elem( "gsui-dotline-in", null,
		$.$elem( "gsui-slider", { type: "linear-y", min: -32, max: 32, step: .01, "mousemove-size": 2000 } ),
		$.$elem( "gsui-dotlinesvg" ),
		$.$elem( "gsui-dropdown", { id: popId, popover: "auto", clicknclose: true },
			$.$elem( "gsui-dropdown-option", { value: "delete", icon: "close", name: GSTX.$delete } ),
			gsuiDotline.$waveTypes.map( w => $.$elem( "gsui-dropdown-option", { radio: "wave", value: w[ 0 ], name: w[ 1 ] } ) ),
		),
	);
} );
