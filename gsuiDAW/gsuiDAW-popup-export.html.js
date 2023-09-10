"use strict";

GSUsetTemplate( "gsui-daw-popup-export", () =>
	GSUcreateDiv( { class: "gsuiDAW-popup-export" },
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Render the current composition" ),
			GSUcreateDiv( { class: "gsuiDAW-popup-export-wrap" },
				GSUcreateA( { class: "gsuiDAW-popup-export-btn", "data-status": 0 },
					GSUcreateSpan( { class: "gsuiDAW-popup-export-btn0" },
						GSUcreateSpan( null, "Render" ),
						GSUcreateI( { class: "gsuiIcon", "data-icon": "render" } ),
					),
					GSUcreateSpan( { class: "gsuiDAW-popup-export-btn1" },
						GSUcreateSpan( null, "Rendering..." ),
						GSUcreateI( { class: "gsuiIcon", "data-spin": "on" } ),
					),
					GSUcreateSpan( { class: "gsuiDAW-popup-export-btn2" },
						GSUcreateSpan( null, "Download WAV file" ),
						GSUcreateI( { class: "gsuiIcon", "data-icon": "export" } ),
					),
				),
				GSUcreateElement( "progress", { class: "gsuiDAW-popup-export-progress", value: "", max: 1 } ),
			),
		),
	)
);
