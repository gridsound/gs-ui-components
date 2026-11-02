"use strict";

$.$setTemplate( "gsui-patterns-synth", () =>
	$.$elem( "gsui-patterns-synth", null,
		$.$elem( "gsui-patterns-synth-head", null,
			$.$button( { "data-action": "expand" },
				$.$icon( { icon: "caret-right" } ),
			),
			$.$elem( "gsui-patterns-synth-info", null,
				$.$elem( "gsui-patterns-synth-name" ),
				$.$button( { class: "gsuiPatterns-btnSolid gsuiPatterns-synth-dest", "data-action": "redirect", "data-tooltip": GSTX.$patterns_redirectSynth },
					$.$icon( { class: "gsuiPatterns-btnIcon", icon: "mixer" } ),
					$.$span( { class: "gsuiPatterns-btnText" } ),
				),
			),
			$.$button( { "data-action": "newPattern", "data-tooltip": GSTX.$patterns_createKeys },
				$.$icon( { icon: "plus" } ),
			),
			$.$button( { "data-action": "delete", "data-tooltip": GSTX.$patterns_deleteSynth },
				$.$icon( { icon: "close" } ),
			),
		),
		$.$elem( "gsui-patterns-synth-patterns", { class: "gsuiPatterns-placeholderToCheck" },
			$.$div( { class: "gsuiPatterns-placeholder", inert: true },
				$.$span( null, GSTX.$patterns_synthNoPat ),
			),
		),
	)
);
