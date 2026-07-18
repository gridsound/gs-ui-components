"use strict";

$.$setTemplate( "gsui-wavetable", () => [
	$.$flex( { class: "gsuiWavetable-head", x: true, ycenter: true, g6: true },
		$.$button( { class: "gsuiWavetable-back", "data-action": "back", "data-tooltip": GSTX.$wavetable_back },
			$.$icon( { icon: "arrow-left" } ),
		),
		$.$span( { class: "gsuiWavetable-title", inert: true }, "wavetable editor" ),
		$.$elem( "gsui-help-link", { page: "synth-wavetable" } ),
	),
	$.$flex( { class: "gsuiWavetable-waves", x: true, f3: true },
		$.$flex( { f1: true },
			$.$elem( "gsui-wavetable-graph" ),
		),
		$.$flex( { y: true, f2: true },
			$.$elem( "gsui-wave-editor" ),
			$.$div( { class: "gsuiWavetable-waves-list" },
				$.$div(),
			),
		),
	),
] );

$.$setTemplate( "gsui-wavetable-wave", ( id, ind ) =>
	$.$flex( { class: "gsuiWavetable-wave", "data-id": id, "data-index": ind, x: true },
		$.$elem( "gsui-periodicwave", { "data-action": "select" } ),
		$.$flex( { "data-action": "select", y: true, xcenter: true, ycenter: true, f1: true },
			$.$span( { inert: true } ),
			$.$button( { "data-action": "clone", "data-tooltip": GSTX.$wavetable_cloneWave },
				$.$icon( { icon: "clone" } ),
			),
			$.$button( { "data-action": "remove", "data-tooltip": GSTX.$wavetable_removeWave },
				$.$icon( { icon: "close" } ),
			),
		),
	),
);
