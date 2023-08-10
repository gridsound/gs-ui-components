"use strict";

GSUsetTemplate( "gsui-pianoroll-block", () =>
	GSUcreateElement( "div", { class: "gsuiBlocksManager-block gsuiPianoroll-block", "data-action": "move" },
		GSUcreateElement( "div", { class: "gsuiDragline-drop" } ),
		GSUcreateElement( "div", { class: "gsuiBlocksManager-block-crop gsuiBlocksManager-block-cropB", "data-action": "cropB" } ),
	)
);
