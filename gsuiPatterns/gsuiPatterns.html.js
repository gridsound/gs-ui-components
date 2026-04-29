"use strict";

$.$setTemplate( "gsui-patterns", () =>
	$.$elem( "gsui-panels", { dir: "y" },
		$.$getTemplate( "gsui-patterns-panel", {
			type: "buffer",
			title: "buffers",
			icon: "cu-waveform",
			placeholder: "drag 'n drop raw files here (mp3, ogg, wav)",
		} ),
		$.$getTemplate( "gsui-patterns-panel", {
			type: "slices",
			title: "slices",
			icon: "slices",
			placeholder: "no slices yet",
			button: { action: "newSlices", title: "Create a new slices pattern" },
		} ),
		$.$getTemplate( "gsui-patterns-panel", {
			type: "drums",
			title: "drums",
			icon: "cu-drums",
			placeholder: "no drums yet",
			button: { action: "newDrums", title: "Create a new drums pattern" },
		} ),
		$.$getTemplate( "gsui-patterns-panel", {
			type: "keys",
			title: "keys",
			icon: "oscillator",
			placeholder: "no synth yet",
			button: { action: "newSynth", title: "Create a new synthesizer" },
		} ),
		$.$getTemplate( "gsui-patterns-panel", {
			type: "automation",
			title: "automations",
			icon: "automation",
			placeholder: "no automation yet",
			button: { action: "newAutomation", title: "Create a new automation" },
		} ),
	)
);

$.$setTemplate( "gsui-patterns-panel", obj =>
	$.$div( { class: "gsuiPatterns-panel", "data-type": obj.type },
		$.$div( { class: "gsuiPatterns-panel-menu" },
			$.$icon( { class: "gsuiPatterns-panel-icon", icon: obj.icon } ),
			$.$span( { class: "gsuiPatterns-panel-title" }, obj.title ),
			obj.button && $.$button( { class: "gsuiPatterns-btnSolid", "data-action": obj.button.action, title: obj.button.title },
				$.$icon( { class: "gsuiPatterns-btnIcon", icon: "plus" } ),
			),
		),
		$.$div( { class: "gsuiPatterns-panel-list-wrap" },
			$.$div( { class: "gsuiPatterns-placeholderToCheck gsuiPatterns-panel-list" } ),
			$.$div( { class: "gsuiPatterns-placeholder", inert: true },
				$.$span( null, obj.placeholder ),
			),
		),
	)
);
