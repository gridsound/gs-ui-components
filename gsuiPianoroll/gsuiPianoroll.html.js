"use strict";

GSUI.setTemplate( "gsui-pianoroll-block", () =>
	GSUI.createElem( "div", { class: "gsuiBlocksManager-block gsuiPianoroll-block", "data-action": "move" },
		GSUI.createElem( "div", { class: "gsuiDragline-drop" } ),
		GSUI.createElem( "div", { class: "gsuiBlocksManager-block-crop gsuiBlocksManager-block-cropB", "data-action": "cropB" } ),
	)
);
