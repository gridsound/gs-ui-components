"use strict";

GSUI.$setTemplate( "gsui-daw-popup-open", () =>
	GSUI.$createElement( "div", { class: "gsuiDAW-popup-open" },
		GSUI.$createElement( "fieldset", null,
			GSUI.$createElement( "legend", null, "Open and load a new composition" ),
			GSUI.$createElement( "div", { class: "gsuiPopup-row" },
				GSUI.$createElement( "div", { class: "gsuiPopup-row-title" }, "With an URL" ),
				GSUI.$createElement( "div", { class: "gsuiPopup-row-values" },
					GSUI.$createElement( "input", { class: "gsuiPopup-inputText", name: "url", type: "url", placeholder: "https://" } ),
				),
			),
			GSUI.$createElement( "div", { class: "gsuiPopup-row" },
				GSUI.$createElement( "div", { class: "gsuiPopup-row-title" },
					"With a local file",
					GSUI.$createElement( "br" ),
					GSUI.$createElement( "small", null, "(Please notice that you can also drop a file into the app)" ),
				),
				GSUI.$createElement( "div", { class: "gsuiPopup-row-values" },
					GSUI.$createElement( "input", { name: "file", type: "file" } ),
				),
			),
		),
	)
);
