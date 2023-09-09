"use strict";

GSUsetTemplate( "gsui-libraries", () => [
	GSUcreateElement( "div", { class: "gsuiLibraries-head" },
		GSUcreateElement( "i", { class: "gsuiLibraries-head-icon gsuiIcon", "data-icon": "waveform" } ),
		GSUcreateElement( "span", { class: "gsuiLibraries-head-title" }, "library" ),
		GSUcreateElement( "div", { class: "gsuiLibraries-libBtns" },
			GSUcreateButton( { class: "gsuiLibraries-libBtn", "data-lib": "default" }, "default" ),
			GSUcreateButton( { class: "gsuiLibraries-libBtn", "data-lib": "local" }, "local" ),
		),
	),
	GSUcreateElement( "div", { class: "gsuiLibraries-body" },
		GSUcreateElement( "gsui-library", { class: "gsuiLibrary-default" } ),
		GSUcreateElement( "gsui-library", { class: "gsuiLibrary-local" } ),
	),
] );
