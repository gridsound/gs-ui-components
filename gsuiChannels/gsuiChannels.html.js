"use strict";

GSUI.setTemplate( "gsui-channels", () => [
	GSUI.createElement( "div", { class: "gsuiChannels-panMain" } ),
	GSUI.createElement( "div", { class: "gsuiChannels-panChannels" },
		GSUI.createElement( "button", { class: "gsuiChannels-addChan" },
			GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "plus" } ),
		),
	),
] );
