"use strict";

GSUsetTemplate( "gsui-pianoroll-block", () =>
	$.$div( { class: "gsuiBlocksManager-block gsuiPianoroll-block", "data-action": "move" },
		$.$span(),
		$.$div( { class: "gsuiDragline-drop" } ),
		$.$div( { "data-action": "cropB" } ),
		$.$elem( "gsui-dragline" ),
	)
);
