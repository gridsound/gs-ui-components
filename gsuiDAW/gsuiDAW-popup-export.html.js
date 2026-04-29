"use strict";

GSUsetTemplate( "gsui-daw-popup-export", () =>
	$.$div( { class: "gsuiDAW-popup-export" },
		$.$elem( "fieldset", null,
			$.$elem( "legend", null, "Render the current composition" ),
			$.$div( { class: "gsuiDAW-popup-export-wrap" },
				$.$elem( "gsui-com-button", { class: "gsuiDAW-popup-export-render-btn" } ),
				$.$elem( "gsui-com-button", { class: "gsuiDAW-popup-export-upload-btn", text: "Upload", icon: "upload" } ),
				$.$elem( "gsui-com-button", { class: "gsuiDAW-popup-export-clear-btn", text: "Clear", type: "danger" } ),
				$.$elem( "progress", { class: "gsuiDAW-popup-export-progress", value: "", max: 1 } ),
			),
			$.$div( { class: "gsuiDAW-popup-export-msg" } ),
		),
	)
);
