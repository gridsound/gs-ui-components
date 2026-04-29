"use strict";

GSUsetTemplate( "gsui-effect", () => [
	$.$div( { class: "gsuiEffect-head" },
		$.$div( { class: "gsuiEffect-grip gsuiIcon", "data-icon": "grip-v" } ),
		$.$button( { class: "gsuiEffect-expand", icon: "caret-right" } ),
		$.$elem( "gsui-toggle", { off: true, title: "Toggle this effect" } ),
		$.$span( { class: "gsuiEffect-name", inert: true } ),
		$.$elem( "gsui-help-link" ),
		$.$button( { class: "gsuiEffect-remove", icon: "close", title: "Delete this effect" } ),
	),
	$.$div( { class: "gsuiEffect-content" } ),
] );
