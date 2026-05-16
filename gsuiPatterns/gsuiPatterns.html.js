"use strict";

$.$setTemplate( "gsui-patterns", () =>
	$.$elem( "gsui-panels", { dir: "y" },
		$.$getTemplate( "gsui-patterns-panel", {
			$type: "buffer",
			$title: "buffers",
			$icon: "cu-waveform",
			$placeholder: GSTX.$patterns_placehBuffer,
		} ),
		$.$getTemplate( "gsui-patterns-panel", {
			$type: "slices",
			$title: "slices",
			$icon: "slices",
			$placeholder: GSTX.$patterns_placehSlices,
			$button: { $action: "newSlices", $tooltip: GSTX.$patterns_createSlices },
		} ),
		$.$getTemplate( "gsui-patterns-panel", {
			$type: "drums",
			$title: "drums",
			$icon: "cu-drums",
			$placeholder: GSTX.$patterns_placehDrums,
			$button: { $action: "newDrums", $tooltip: GSTX.$patterns_createDrums },
		} ),
		$.$getTemplate( "gsui-patterns-panel", {
			$type: "keys",
			$title: "keys",
			$icon: "oscillator",
			$placeholder: GSTX.$patterns_placehSynths,
			$button: { $action: "newSynth", $tooltip: GSTX.$patterns_createSynth },
		} ),
		$.$getTemplate( "gsui-patterns-panel", {
			$type: "automation",
			$title: "automations",
			$icon: "automation",
			$placeholder: GSTX.$patterns_placehAutomat,
			$button: { $action: "newAutomation", $tooltip: GSTX.$patterns_createAutomat },
		} ),
	)
);

$.$setTemplate( "gsui-patterns-panel", o =>
	$.$div( { class: "gsuiPatterns-panel", "data-type": o.$type },
		$.$div( { class: "gsuiPatterns-panel-menu" },
			$.$icon( { class: "gsuiPatterns-panel-icon", icon: o.$icon } ),
			$.$span( { class: "gsuiPatterns-panel-title" }, o.$title ),
			o.$button && $.$button( { class: "gsuiPatterns-btnSolid", "data-action": o.$button.$action, "data-tooltip": o.$button.$tooltip },
				$.$icon( { class: "gsuiPatterns-btnIcon", icon: "plus" } ),
			),
		),
		$.$div( { class: "gsuiPatterns-panel-list-wrap" },
			$.$div( { class: "gsuiPatterns-placeholderToCheck gsuiPatterns-panel-list" } ),
			$.$div( { class: "gsuiPatterns-placeholder", inert: true },
				$.$span( null, o.$placeholder ),
			),
		),
	)
);
