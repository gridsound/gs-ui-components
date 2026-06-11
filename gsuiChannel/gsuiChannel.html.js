"use strict";

$.$setTemplate( "gsui-channel", () => [
	$.$button( { class: "gsuiChannel-head", "data-tooltip": GSTX.$channel_rename },
		$.$bold( { inert: true } ),
		$.$span( { inert: true } ),
	),
	$.$button( { class: "gsuiChannel-delete", icon: "close", "data-tooltip": GSTX.$channel_remove } ),
	$.$div( { class: "gsuiChannel-analyser" },
		$.$elem( "gsui-analyser-hist" ),
		$.$div( { class: "gsuiChannel-effects" } ),
	),
	$.$elem( "gsui-toggle", { "data-tooltip": GSTX.$channel_mute } ),
	$.$div( { class: "gsuiChannel-pan" },
		$.$elem( "gsui-slider", { type: "circular", min: -1, max: 1, step: .02, "mousemove-size": 800, "stroke-width": 3, "data-prop": "pan", defaultValue: 0, "data-tooltip": GSTX.$channel_pan } ),
	),
	$.$div( { class: "gsuiChannel-gain" },
		$.$elem( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 400, "data-prop": "gain", defaultValue: 1, "data-tooltip": GSTX.$channel_gain } ),
	),
	$.$button( { class: "gsuiChannel-connect" },
		$.$icon( { class: "gsuiChannel-connectA", icon: "caret-up" } ),
		$.$icon( { class: "gsuiChannel-connectB", icon: "caret-up" } ),
	),
	$.$elem( "gsui-channel-grip", { class: "gsuiIcon", "data-icon": "grip-h" } ),
] );

$.$setTemplate( "gsui-channel-effect", ( id, name ) =>
	$.$button( { class: "gsuiChannel-effect", "data-id": id, "data-enable": true },
		$.$span( { class: "gsuiChannel-effect-name" }, name ),
	),
);
