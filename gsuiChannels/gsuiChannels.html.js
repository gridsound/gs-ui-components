"use strict";

GSUI.$setTemplate( "gsui-channels", () => [
	GSUI.$createElement( "div", { class: "gsuiChannels-panMain" } ),
	GSUI.$createElement( "div", { class: "gsuiChannels-panChannels" },
		GSUI.$createElement( "button", { class: "gsuiChannels-addChan", title: "Add a channel" },
			GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "channels" } ),
			GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "plus" } ),
		),
	),
] );

GSUI.$setTemplate( "gsui-channels-selectPopup", () =>
	GSUI.$createElement( "div", null,
		GSUI.$createElement( "fieldset", null,
			GSUI.$createElement( "legend", null, "Select a channel" ),
			GSUI.$createElement( "select", { name: "channel", size: 8 } ),
		),
	)
);
