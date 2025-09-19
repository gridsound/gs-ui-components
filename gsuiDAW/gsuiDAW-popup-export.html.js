"use strict";

GSUsetTemplate( "gsui-daw-popup-export", () =>
	GSUcreateDiv( { class: "gsuiDAW-popup-export" },
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Render the current composition" ),
			GSUcreateDiv( { class: "gsuiDAW-popup-export-wrap" },
				GSUcreateElement( "gsui-com-button", { class: "gsuiDAW-popup-export-render-btn" } ),
				GSUcreateElement( "gsui-com-button", { class: "gsuiDAW-popup-export-upload-btn", text: "Upload", icon: "upload" } ),
				GSUcreateElement( "gsui-com-button", { class: "gsuiDAW-popup-export-clear-btn", text: "Clear", type: "danger" } ),
				GSUcreateElement( "progress", { class: "gsuiDAW-popup-export-progress", value: "", max: 1 } ),
			),
			GSUcreateDiv( { class: "gsuiDAW-popup-export-msg" } ),
		),
	)
);
