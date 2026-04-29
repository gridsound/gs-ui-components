"use strict";

GSUsetTemplate( "gsui-patterns-pattern", () =>
	$.$div( { class: "gsuiPatterns-pattern" },
		$.$div( { class: "gsuiPatterns-pattern-grip gsuiIcon", "data-icon": "grip-v" } ),
		$.$div( { class: "gsuiPatterns-pattern-head" },
			$.$div( { class: "gsuiPatterns-pattern-info" },
				$.$button( { class: "gsuiPatterns-pattern-btn gsuiPatterns-pattern-btnInfo", "data-action": "editInfo", icon: "buf-undefined", title: "Edit buffer's info" } ),
				$.$div( { class: "gsuiPatterns-pattern-name" } ),
				$.$button( { class: "gsuiPatterns-btnSolid gsuiPatterns-pattern-dest", "data-action": "redirect", title: "Redirect this pattern" },
					$.$icon( { class: "gsuiPatterns-btnIcon", icon: "mixer" } ),
					$.$span( { class: "gsuiPatterns-btnText" } ),
				),
			),
			$.$button( { class: "gsuiPatterns-pattern-btn", "data-action": "clone",  icon: "clone", title: "Clone this pattern" } ),
			$.$button( { class: "gsuiPatterns-pattern-btn", "data-action": "remove", icon: "close", title: "Delete this pattern" } ),
		),
		$.$div( { class: "gsuiPatterns-pattern-content" } ),
		$.$div( { class: "gsuiPatterns-pattern-placeholder" },
			$.$icon( { icon: "file-corrupt" } ),
		),
	)
);
