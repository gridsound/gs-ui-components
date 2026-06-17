"use strict";

$.$setTemplate( "gsui-patterns-synth", () =>
	$.$div( { class: "gsuiPatterns-synth" },
		$.$div( { class: "gsuiPatterns-synth-head" },
			$.$button( { class: "gsuiPatterns-synth-btn gsuiPatterns-synth-expand", "data-action": "expand" },
				$.$icon( { icon: "caret-right" } ),
			),
			$.$div( { class: "gsuiPatterns-synth-info" },
				$.$div( { class: "gsuiPatterns-synth-name" } ),
				$.$button( { class: "gsuiPatterns-btnSolid gsuiPatterns-synth-dest", "data-action": "redirect", "data-tooltip": GSTX.$patterns_redirectSynth },
					$.$icon( { class: "gsuiPatterns-btnIcon", icon: "mixer" } ),
					$.$span( { class: "gsuiPatterns-btnText" } ),
				),
			),
			$.$button( { class: "gsuiPatterns-synth-btn", "data-action": "newPattern", "data-tooltip": GSTX.$patterns_createKeys },
				$.$icon( { icon: "plus" } ),
			),
			$.$button( { class: "gsuiPatterns-synth-btn", "data-action": "delete", "data-tooltip": GSTX.$patterns_deleteSynth },
				$.$icon( { icon: "close" } ),
			),
		),
		$.$div( { class: "gsuiPatterns-placeholderToCheck gsuiPatterns-synth-patterns" },
			$.$div( { class: "gsuiPatterns-placeholder", inert: true },
				$.$span( null, "this synthesizer has no related pattern" ),
			),
		),
	)
);
