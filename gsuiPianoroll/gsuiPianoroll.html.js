"use strict";

GSUsetTemplate( "gsui-pianoroll-block", () =>
	GSUcreateDiv( { class: "gsuiBlocksManager-block gsuiPianoroll-block", "data-action": "move" },
		GSUcreateSpan(),
		GSUcreateDiv( { class: "gsuiDragline-drop" } ),
		GSUcreateDiv( { "data-action": "cropB" } ),
		GSUcreateElement( "gsui-dragline" ),
	)
);
