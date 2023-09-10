"use strict";

GSUsetTemplate( "gsui-mixer", () =>
	GSUcreateElement( "gsui-panels", { dir: "x" },
		GSUcreateDiv( { class: "gsuiMixer-channels" },
			GSUcreateDiv( { class: "gsuiMixer-head", inert: true },
				GSUcreateI( { class: "gsuiMixer-head-icon gsuiIcon", "data-icon": "channels" } ),
				GSUcreateSpan( { class: "gsuiMixer-head-title" }, "channels" ),
			),
			GSUcreateElement( "gsui-channels" ),
		),
		GSUcreateDiv( { class: "gsuiMixer-effects" },
			GSUcreateDiv( { class: "gsuiMixer-head", inert: true },
				GSUcreateI( { class: "gsuiMixer-head-icon gsuiIcon", "data-icon": "effects" } ),
				GSUcreateSpan( { class: "gsuiMixer-head-title" }, "effects" ),
			),
			GSUcreateElement( "gsui-effects" ),
		),
	),
);
