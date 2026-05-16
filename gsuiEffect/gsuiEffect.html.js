"use strict";

$.$setTemplate( "gsui-effect", () => [
	$.$div( { class: "gsuiEffect-head" },
		$.$div( { class: "gsuiEffect-grip gsuiIcon", "data-icon": "grip-v" } ),
		$.$button( { class: "gsuiEffect-expand", icon: "caret-right" } ),
		$.$elem( "gsui-toggle", { off: true, "data-tooltip": GSTX.$effect_mute } ),
		$.$span( { class: "gsuiEffect-name", inert: true } ),
		$.$elem( "gsui-help-link" ),
		$.$button( { class: "gsuiEffect-remove", icon: "close", "data-tooltip": GSTX.$effect_remove } ),
	),
	$.$div( { class: "gsuiEffect-content" } ),
] );
