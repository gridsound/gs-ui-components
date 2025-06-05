"use strict";

GSUsetTemplate( "gsui-daw-popup-export", () =>
	GSUcreateDiv( { class: "gsuiDAW-popup-export" },
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Render the current composition" ),
			GSUcreateDiv( { class: "gsuiDAW-popup-export-wrap" },
				GSUcreateA( { class: "gsuiDAW-popup-export-btn", "data-status": 0 },
					GSUcreateSpan( { class: "gsuiDAW-popup-export-btn0" },
						GSUcreateSpan( null, "Render" ),
						GSUcreateIcon( { icon: "render" } ),
					),
					GSUcreateSpan( { class: "gsuiDAW-popup-export-btn1" },
						GSUcreateSpan( null, "Rendering..." ),
						GSUcreateIcon( { spin: true } ),
					),
					GSUcreateSpan( { class: "gsuiDAW-popup-export-btn2" },
						GSUcreateSpan( null, "Download WAV file" ),
						GSUcreateIcon( { icon: "export" } ),
					),
				),
				GSUcreateElement( "progress", { class: "gsuiDAW-popup-export-progress", value: "", max: 1 } ),
			),
		),
	)
);
