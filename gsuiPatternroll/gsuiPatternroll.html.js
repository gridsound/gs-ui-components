"use strict";

GSUsetTemplate( "gsui-patternroll-block", () =>
	$.$div( { class: "gsuiBlocksManager-block gsuiPatternroll-block", "data-action": "move" },
		$.$div( { "data-action": "cropA" } ),
		$.$div( { "data-action": "cropB" } ),
		$.$div( { class: "gsuiPatternroll-block-header" },
			$.$span( { class: "gsuiPatternroll-block-name" } ),
		),
		$.$div( { class: "gsuiPatternroll-block-content" } ),
	)
);
