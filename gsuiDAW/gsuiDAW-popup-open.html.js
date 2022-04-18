"use strict";

GSUI.setTemplate( "gsui-daw-popup-open", () =>
	GSUI.createElem( "div", { class: "gsuiDAW-popup-open" },
		GSUI.createElem( "fieldset", null,
			GSUI.createElem( "legend", null, "Open and load a new composition" ),
			GSUI.createElem( "div", { class: "gsuiPopup-row" },
				GSUI.createElem( "div", { class: "gsuiPopup-row-title" }, "With an URL" ),
				GSUI.createElem( "div", { class: "gsuiPopup-row-values" },
					GSUI.createElem( "input", { class: "gsuiPopup-inputText", name: "url", type: "url", placeholder: "https://" } ),
				),
			),
			GSUI.createElem( "div", { class: "gsuiPopup-row" },
				GSUI.createElem( "div", { class: "gsuiPopup-row-title" },
					"With a local file",
					GSUI.createElem( "br" ),
					GSUI.createElem( "small", null, "(Please notice that you can also drop a file into the app)" ),
				),
				GSUI.createElem( "div", { class: "gsuiPopup-row-values" },
					GSUI.createElem( "input", { name: "file", type: "file" } ),
				),
			),
		),
	)
);
