"use strict";

GSUsetTemplate( "gsui-daw-popup-open", () =>
	GSUcreateDiv( { class: "gsuiDAW-popup-open" },
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Open and load a new composition" ),
			GSUcreateDiv( { class: "gsuiPopup-row" },
				GSUcreateDiv( { class: "gsuiPopup-row-title" }, "With an URL" ),
				GSUcreateDiv( { class: "gsuiPopup-row-values" },
					GSUcreateInput( { class: "gsuiPopup-inputText", name: "url", type: "url", placeholder: "https://" } ),
				),
			),
			GSUcreateDiv( { class: "gsuiPopup-row" },
				GSUcreateDiv( { class: "gsuiPopup-row-title" },
					"With a local file",
					GSUcreateElement( "br" ),
					GSUcreateElement( "small", null, "(Please notice that you can also drop a file into the app)" ),
				),
				GSUcreateDiv( { class: "gsuiPopup-row-values" },
					GSUcreateInput( { name: "file", type: "file" } ),
				),
			),
		),
	)
);
