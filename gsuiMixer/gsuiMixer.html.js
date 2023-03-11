"use strict";

GSUI.$setTemplate( "gsui-mixer", () =>
	GSUI.$createElement( "gsui-panel", {},
		GSUI.$createElement( "div", { class: "gsuiMixer-channels" },
			GSUI.$createElement( "div", { class: "gsuiMixer-head", inert: true },
				GSUI.$createElement( "i", { class: "gsuiMixer-head-icon gsuiIcon", "data-icon": "channels" } ),
				GSUI.$createElement( "span", { class: "gsuiMixer-head-title" }, "channels" ),
			),
			GSUI.$createElement( "gsui-channels" ),
		),
		GSUI.$createElement( "div", { class: "gsuiMixer-effects" },
			GSUI.$createElement( "div", { class: "gsuiMixer-head", inert: true },
				GSUI.$createElement( "i", { class: "gsuiMixer-head-icon gsuiIcon", "data-icon": "effects" } ),
				GSUI.$createElement( "span", { class: "gsuiMixer-head-title" }, "effects" ),
			),
			GSUI.$createElement( "gsui-effects" ),
		),
	),
);
