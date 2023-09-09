"use strict";

GSUsetTemplate( "gsui-channels", () => [
	GSUcreateElement( "div", { class: "gsuiChannels-panMain" } ),
	GSUcreateElement( "div", { class: "gsuiChannels-panChannels" },
		GSUcreateButton( { class: "gsuiChannels-addChan", title: "Add a channel" },
			GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "channels" } ),
			GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "plus" } ),
		),
	),
] );

GSUsetTemplate( "gsui-channels-selectPopup", () =>
	GSUcreateElement( "div", null,
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Select a channel" ),
			GSUcreateElement( "select", { name: "channel", size: 8 } ),
		),
	)
);
