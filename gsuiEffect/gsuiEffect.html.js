"use strict";

$.$setTemplate( "gsui-effect", () => [
	$.$elem( "gsui-effect-head", null,
		$.$elem( "gsui-effect-grip", null,
			$.$icon( { icon: "grip-v" } ),
		),
		$.$button( { "data-action": "expand" },
			$.$icon( { icon: "caret-right" } ),
		),
		$.$elem( "gsui-toggle", { off: true, "data-tooltip": GSTX.$effect_mute } ),
		$.$elem( "gsui-effect-name", { inert: true } ),
		$.$elem( "gsui-help-link" ),
		$.$button( { "data-action": "remove", "data-tooltip": GSTX.$effect_remove },
			$.$icon( { icon: "close" } ),
		),
	),
	$.$elem( "gsui-effect-content" ),
] );
