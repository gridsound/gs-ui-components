"use strict";

GSUI.$setTemplate( "gsui-mixer", () =>
	GSUI.$createElement( "gsui-panel", {},
		GSUI.$createElement( "div", { class: "gsuiMixer-channels" },
			GSUI.$createElement( "div", { class: "gsuiMixer-head" },
				GSUI.$createElement( "i", { class: "gsuiMixer-head-icon gsuiIcon", "data-icon": "channels" } ),
				GSUI.$createElement( "span", { class: "gsuiMixer-head-title" }, "Channels" ),
			),
			GSUI.$createElement( "gsui-channels" ),
		),
		GSUI.$createElement( "div", { class: "gsuiMixer-effects" },
			GSUI.$createElement( "div", { class: "gsuiMixer-head" },
				GSUI.$createElement( "i", { class: "gsuiMixer-head-icon gsuiIcon", "data-icon": "effects" } ),
				GSUI.$createElement( "span", { class: "gsuiMixer-head-title" }, "Effects" ),
			),
			GSUI.$createElement( "gsui-effects" ),
		),
	),
);
