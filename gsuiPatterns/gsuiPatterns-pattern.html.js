"use strict";

$.$setTemplate( "gsui-patterns-pattern", () =>
	$.$div( { class: "gsuiPatterns-pattern" },
		$.$div( { class: "gsuiPatterns-pattern-grip" },
			$.$icon( { icon: "grip-v" } ),
		),
		$.$div( { class: "gsuiPatterns-pattern-head" },
			$.$div( { class: "gsuiPatterns-pattern-info" },
				$.$button( { class: "gsuiPatterns-pattern-btn gsuiPatterns-pattern-btnInfo", "data-action": "editInfo", icon: "question", "data-tooltip": GSTX.$patterns_editPatternInfo } ),
				$.$div( { class: "gsuiPatterns-pattern-name" } ),
				$.$button( { class: "gsuiPatterns-btnSolid gsuiPatterns-pattern-dest", "data-action": "redirect", "data-tooltip": GSTX.$patterns_redirectPattern },
					$.$icon( { class: "gsuiPatterns-btnIcon", icon: "mixer" } ),
					$.$span( { class: "gsuiPatterns-btnText" } ),
				),
			),
			$.$button( { class: "gsuiPatterns-pattern-btn", "data-action": "clone",  icon: "clone", "data-tooltip": GSTX.$patterns_clonePattern } ),
			$.$button( { class: "gsuiPatterns-pattern-btn", "data-action": "remove", icon: "close", "data-tooltip": GSTX.$patterns_deletePattern } ),
		),
		$.$div( { class: "gsuiPatterns-pattern-content" } ),
		$.$div( { class: "gsuiPatterns-pattern-placeholder" },
			$.$icon( { icon: "file-corrupt" } ),
		),
	)
);
