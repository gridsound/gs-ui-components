"use strict";

$.$setTemplate( "gsui-channel", () => [
	$.$button( { class: "gsuiChannel-head", title: "Double-click to rename" },
		$.$bold( { inert: true } ),
		$.$span( { inert: true } ),
	),
	$.$button( { class: "gsuiChannel-headBtn gsuiChannel-delete", icon: "close", title: "Remove the channel" } ),
	$.$div( { class: "gsuiChannel-analyser" },
		$.$elem( "gsui-analyser-hist" ),
		$.$div( { class: "gsuiChannel-effects" } ),
	),
	$.$elem( "gsui-toggle" ),
	$.$div( { class: "gsuiChannel-pan" },
		$.$elem( "gsui-slider", { type: "circular", min: -1, max: 1, step: .02, "mousemove-size": 800, "stroke-width": 3, "data-prop": "pan", defaultValue: 0 } ),
	),
	$.$div( { class: "gsuiChannel-gain" },
		$.$elem( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 400, "data-prop": "gain", defaultValue: 1 } ),
	),
	$.$button( { class: "gsuiChannel-connect" },
		$.$icon( { class: "gsuiChannel-connectA", icon: "caret-up" } ),
		$.$icon( { class: "gsuiChannel-connectB", icon: "caret-up" } ),
	),
	$.$div( { class: "gsuiChannel-grip gsuiIcon", "data-icon": "grip-h" } ),
] );

$.$setTemplate( "gsui-channel-effect", ( id, name ) =>
	$.$button( { class: "gsuiChannel-effect", "data-id": id, "data-enable": true },
		$.$span( { class: "gsuiChannel-effect-name" }, name ),
	),
);
