"use strict";

GSUsetTemplate( "gsui-mixer", () =>
	GSUcreateElement( "gsui-panels", { dir: "x" },
		GSUcreateElement( "div", { class: "gsuiMixer-channels" },
			GSUcreateElement( "div", { class: "gsuiMixer-head", inert: true },
				GSUcreateElement( "i", { class: "gsuiMixer-head-icon gsuiIcon", "data-icon": "channels" } ),
				GSUcreateElement( "span", { class: "gsuiMixer-head-title" }, "channels" ),
			),
			GSUcreateElement( "gsui-channels" ),
		),
		GSUcreateElement( "div", { class: "gsuiMixer-effects" },
			GSUcreateElement( "div", { class: "gsuiMixer-head", inert: true },
				GSUcreateElement( "i", { class: "gsuiMixer-head-icon gsuiIcon", "data-icon": "effects" } ),
				GSUcreateElement( "span", { class: "gsuiMixer-head-title" }, "effects" ),
			),
			GSUcreateElement( "gsui-effects" ),
		),
	),
);
