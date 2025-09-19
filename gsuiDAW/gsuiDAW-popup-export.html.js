"use strict";

GSUsetTemplate( "gsui-daw-popup-export", () =>
	GSUcreateDiv( { class: "gsuiDAW-popup-export" },
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Render the current composition" ),
			GSUcreateDiv( { class: "gsuiDAW-popup-export-wrap" },
				GSUcreateElement( "gsui-com-button", { class: "gsuiDAW-popup-export-btn" } ),
				GSUcreateElement( "progress", { class: "gsuiDAW-popup-export-progress", value: "", max: 1 } ),
			),
		),
	)
);
