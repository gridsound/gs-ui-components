"use strict";

GSUsetTemplate( "gsui-patterns-synth", () =>
	$.$div( { class: "gsuiPatterns-synth" },
		$.$div( { class: "gsuiPatterns-synth-head" },
			$.$button( { class: "gsuiPatterns-synth-btn gsuiPatterns-synth-expand", "data-action": "expand", icon: "caret-right" } ),
			$.$div( { class: "gsuiPatterns-synth-info" },
				$.$div( { class: "gsuiPatterns-synth-name" } ),
				$.$button( { class: "gsuiPatterns-btnSolid gsuiPatterns-synth-dest", "data-action": "redirect", title: "Redirect this synthesizer" },
					$.$icon( { class: "gsuiPatterns-btnIcon", icon: "mixer" } ),
					$.$span( { class: "gsuiPatterns-btnText" } ),
				),
			),
			$.$button( { class: "gsuiPatterns-synth-btn", "data-action": "newPattern", icon: "plus",  title: "Create a new pattern with this synthesizer" } ),
			$.$button( { class: "gsuiPatterns-synth-btn", "data-action": "delete",     icon: "close", title: "Delete the synthesizer and its patterns" } ),
		),
		$.$div( { class: "gsuiPatterns-placeholderToCheck gsuiPatterns-synth-patterns" },
			$.$div( { class: "gsuiPatterns-placeholder", inert: true },
				$.$span( null, "this synthesizer has no related pattern" ),
			),
		),
	)
);
