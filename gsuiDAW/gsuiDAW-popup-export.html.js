"use strict";

GSUsetTemplate( "gsui-daw-popup-export", () =>
	GSUcreateElement( "div", { class: "gsuiDAW-popup-export" },
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Render the current composition" ),
			GSUcreateElement( "div", { class: "gsuiDAW-popup-export-wrap" },
				GSUcreateElement( "a", { href: true, class: "gsuiDAW-popup-export-btn", "data-status": 0 },
					GSUcreateElement( "span", { class: "gsuiDAW-popup-export-btn0" },
						GSUcreateElement( "span", null, "Render" ),
						GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "render" } ),
					),
					GSUcreateElement( "span", { class: "gsuiDAW-popup-export-btn1" },
						GSUcreateElement( "span", null, "Rendering..." ),
						GSUcreateElement( "i", { class: "gsuiIcon", "data-spin": "on" } ),
					),
					GSUcreateElement( "span", { class: "gsuiDAW-popup-export-btn2" },
						GSUcreateElement( "span", null, "Download WAV file" ),
						GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "export" } ),
					),
				),
				GSUcreateElement( "progress", { class: "gsuiDAW-popup-export-progress", value: "", max: 1 } ),
			),
		),
	)
);
