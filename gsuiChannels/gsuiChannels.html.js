"use strict";

$.$setTemplate( "gsui-channels", () => [
	$.$elem( "gsui-channels-main", null,
		$.$elem( "gsui-analyser-vu", { max: 120, "data-tooltip": GSTX.$channels_vu } ),
	),
	$.$elem( "gsui-channels-others", null,
		$.$button( { "data-tooltip": GSTX.$channels_add },
			$.$icon( { icon: "channels" } ),
			$.$icon( { icon: "plus" } ),
		),
	),
] );

$.$setTemplate( "gsui-channels-selectPopup", () =>
	$.$div( null,
		$.$elem( "fieldset", null,
			$.$elem( "legend", null, "Select a channel" ),
			$.$select( { name: "channel", size: 8, style: "height:146px" } ),
		),
	)
);
