"use strict";

GSUsetTemplate( "gsui-daw-popup-open", () =>
	GSUcreateElement( "div", { class: "gsuiDAW-popup-open" },
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Open and load a new composition" ),
			GSUcreateElement( "div", { class: "gsuiPopup-row" },
				GSUcreateElement( "div", { class: "gsuiPopup-row-title" }, "With an URL" ),
				GSUcreateElement( "div", { class: "gsuiPopup-row-values" },
					GSUcreateElement( "input", { class: "gsuiPopup-inputText", name: "url", type: "url", placeholder: "https://" } ),
				),
			),
			GSUcreateElement( "div", { class: "gsuiPopup-row" },
				GSUcreateElement( "div", { class: "gsuiPopup-row-title" },
					"With a local file",
					GSUcreateElement( "br" ),
					GSUcreateElement( "small", null, "(Please notice that you can also drop a file into the app)" ),
				),
				GSUcreateElement( "div", { class: "gsuiPopup-row-values" },
					GSUcreateElement( "input", { name: "file", type: "file" } ),
				),
			),
		),
	)
);
