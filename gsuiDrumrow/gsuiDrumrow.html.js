"use strict";

$.$setTemplate( "gsui-drumrow", () => [
	$.$div( { class: "gsuiDrumrow-grip" },
		$.$icon( { icon: "grip-v" } ),
	),
	$.$div( { class: "gsuiDrumrow-main" },
		$.$elem( "gsui-toggle", { title: "Toggle the drumrow (right click for solo)" } ),
		$.$button( { class: "gsuiDrumrow-btnProps",  "data-action": "props",  icon: "drumprops", title: "Expand props panel" } ),
		$.$button( { class: "gsuiDrumrow-btnDelete", "data-action": "delete", icon: "close",     title: "Remove the drumrow" } ),
		$.$span( { class: "gsuiDrumrow-name" } ),
		$.$div( { class: "gsuiDrumrow-waveWrap" },
			$.$elem( "gsui-time-cursors", { resolution: 128 } ),
		),
		$.$elem( "gsui-slider", { type: "linear-y", min: -12, max: 12, step: 1, "mousemove-size": 400, "data-prop": "detune", defaultValue: 0 } ),
		$.$elem( "gsui-slider", { type: "linear-y", min: -1, max: 1, step: .02, "mousemove-size": 400, "data-prop": "pan", defaultValue: 0 } ),
		$.$elem( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 400, "data-prop": "gain", defaultValue: 1 } ),
	),
	$.$elem( "gsui-prop-select", { props: "gain pan detune:pitch" } ),
] );
