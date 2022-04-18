"use strict";

GSUI.setTemplate( "gsui-daw-popup-export", () =>
	GSUI.createElem( "div", { class: "gsuiDAW-popup-export" },
		GSUI.createElem( "fieldset", null,
			GSUI.createElem( "legend", null, "Render the current composition" ),
			GSUI.createElem( "div", { class: "gsuiDAW-popup-export-wrap" },
				GSUI.createElem( "a", { href: true, class: "gsuiDAW-popup-export-btn", "data-status": 0 },
					GSUI.createElem( "span", { class: "gsuiDAW-popup-export-btn0" },
						GSUI.createElem( "span", null, "Render" ),
						GSUI.createElem( "i", { class: "gsuiIcon", "data-icon": "render" } ),
					),
					GSUI.createElem( "span", { class: "gsuiDAW-popup-export-btn1" },
						GSUI.createElem( "span", null, "Rendering..." ),
						GSUI.createElem( "i", { class: "gsuiIcon", "data-spin": "on" } ),
					),
					GSUI.createElem( "span", { class: "gsuiDAW-popup-export-btn2" },
						GSUI.createElem( "span", null, "Download WAV file" ),
						GSUI.createElem( "i", { class: "gsuiIcon", "data-icon": "export" } ),
					),
				),
				GSUI.createElem( "progress", { class: "gsuiDAW-popup-export-progress", value: "", max: 1 } ),
			),
		),
	)
);
