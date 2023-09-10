"use strict";

GSUsetTemplate( "gsui-channels", () => [
	GSUcreateDiv( { class: "gsuiChannels-panMain" } ),
	GSUcreateDiv( { class: "gsuiChannels-panChannels" },
		GSUcreateButton( { class: "gsuiChannels-addChan", title: "Add a channel" },
			GSUcreateI( { class: "gsuiIcon", "data-icon": "channels" } ),
			GSUcreateI( { class: "gsuiIcon", "data-icon": "plus" } ),
		),
	),
] );

GSUsetTemplate( "gsui-channels-selectPopup", () =>
	GSUcreateDiv( null,
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Select a channel" ),
			GSUcreateSelect( { name: "channel", size: 8 } ),
		),
	)
);
