"use strict";

GSUsetTemplate( "gsui-titleuser", () => [
	GSUcreateDiv( { class: "gsuiTitleUser-top" },
		GSUcreateSpan( { class: "gsuiTitleUser-gs", inert: true }, "GridSound" ),
		GSUcreateButton( { class: "gsuiTitleUser-login gsuiIcon", "data-icon": "profile", title: "Login / connection" } ),
		GSUcreateAExt( { class: "gsuiTitleUser-user", title: "Go to your profile" },
			GSUcreateDiv( { class: "gsuiTitleUser-avatar", inert: true } ),
			GSUcreateDiv( { class: "gsuiTitleUser-names", inert: true },
				GSUcreateSpan( { class: "gsuiTitleUser-name" } ),
				GSUcreateSpan( { class: "gsuiTitleUser-username" } ),
			),
		),
		GSUcreateButton( { class: "gsuiTitleUser-logout gsuiIcon", "data-icon": "logout", title: "Logout / disconnect" } ),
	),
	GSUcreateDiv( { class: "gsuiTitleUser-cmp" },
		GSUcreateButton( { class: "gsuiTitleUser-save gsuiIcon", "data-icon": "upload", title: "Save composition" } ),
		GSUcreateSpan(   { class: "gsuiTitleUser-justSaved", inert: true }, "SAVED" ),
		GSUcreateButton( { class: "gsuiTitleUser-rename", title: "Edit composition's title" },
			GSUcreateSpan( { class: "gsuiTitleUser-cmpName", inert: true } ),
			GSUcreateI(    { class: "gsuiTitleUser-cmpEditIcon gsuiIcon", "data-icon": "pen", inert: true } ),
			GSUcreateSpan( { class: "gsuiTitleUser-cmpDur", inert: true } ),
		),
	),
] );
