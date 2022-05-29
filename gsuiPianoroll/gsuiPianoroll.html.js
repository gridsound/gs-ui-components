"use strict";

GSUI.$setTemplate( "gsui-pianoroll-block", () =>
	GSUI.$createElement( "div", { class: "gsuiBlocksManager-block gsuiPianoroll-block", "data-action": "move" },
		GSUI.$createElement( "div", { class: "gsuiDragline-drop" } ),
		GSUI.$createElement( "div", { class: "gsuiBlocksManager-block-crop gsuiBlocksManager-block-cropB", "data-action": "cropB" } ),
	)
);
