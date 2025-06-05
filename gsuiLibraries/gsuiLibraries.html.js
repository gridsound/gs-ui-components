"use strict";

GSUsetTemplate( "gsui-libraries", () => [
	GSUcreateDiv( { class: "gsuiLibraries-head" },
		GSUcreateIcon( { class: "gsuiLibraries-head-icon", icon: "waveform" } ),
		GSUcreateSpan( { class: "gsuiLibraries-head-title" }, "library" ),
		GSUcreateDiv( { class: "gsuiLibraries-libBtns" },
			GSUcreateButton( { class: "gsuiLibraries-libBtn", "data-lib": "default" }, "default" ),
			GSUcreateButton( { class: "gsuiLibraries-libBtn", "data-lib": "local" }, "local" ),
		),
	),
	GSUcreateDiv( { class: "gsuiLibraries-body" },
		GSUcreateElement( "gsui-library", { class: "gsuiLibrary-default" } ),
		GSUcreateElement( "gsui-library", { class: "gsuiLibrary-local" } ),
	),
] );
