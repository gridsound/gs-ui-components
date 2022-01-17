"use strict";

GSUI.setTemplate( "gsui-mixer", () => [
	GSUI.createElement( "div", { class: "gsuiMixer-panMain" } ),
	GSUI.createElement( "div", { class: "gsuiMixer-panChannels" },
		GSUI.createElement( "button", { class: "gsuiMixer-addChan" },
			GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "plus" } ),
		),
	),
] );
