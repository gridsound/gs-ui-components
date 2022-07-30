"use strict";

GSUI.$setTemplate( "gsui-libraries", () => [
	GSUI.$createElement( "div", { class: "gsuiLibraries-head" },
		GSUI.$createElement( "i", { class: "gsuiLibraries-head-icon gsuiIcon", "data-icon": "waveform" } ),
		GSUI.$createElement( "span", { class: "gsuiLibraries-head-title" }, "library" ),
		GSUI.$createElement( "div", { class: "gsuiLibraries-libBtns" },
			GSUI.$createElement( "button", { type: "button", class: "gsuiLibraries-libBtn", "data-lib": "default" }, "default" ),
			GSUI.$createElement( "button", { type: "button", class: "gsuiLibraries-libBtn", "data-lib": "local" }, "local" ),
		),
	),
	GSUI.$createElement( "div", { class: "gsuiLibraries-body" },
		GSUI.$createElement( "gsui-library", { class: "gsuiLibrary-default" } ),
		GSUI.$createElement( "gsui-library", { class: "gsuiLibrary-local" } ),
	),
] );
