"use strict";

GSUsetTemplate( "gsui-pianoroll-block", () =>
	GSUcreateDiv( { class: "gsuiBlocksManager-block gsuiPianoroll-block", "data-action": "move" },
		GSUcreateDiv( { class: "gsuiPianoroll-block-key" } ),
		GSUcreateDiv( { class: "gsuiDragline-drop" } ),
		GSUcreateDiv( { class: "gsuiBlocksManager-block-crop gsuiBlocksManager-block-cropB", "data-action": "cropB" } ),
	)
);
