"use strict";

GSUsetTemplate( "gsui-daw-popup-auth", () =>
	GSUcreateDiv( { id: "authPopupContent", class: "gsuiDAW-popup-auth" },
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Sign in" ),
			GSUcreateDiv( { class: "gsuiPopup-row" },
				GSUcreateDiv( { class: "gsuiPopup-row-title" },
					GSUcreateSpan( null, "Username" ),
					GSUcreateElement( "br" ),
					GSUcreateElement( "small", null, "(or email)" ),
				),
				GSUcreateDiv( { class: "gsuiPopup-row-values" },
					GSUcreateInput( { class: "gsuiPopup-inputText", required: true, name: "email", type: "text" } ),
				),
			),
			GSUcreateDiv( { class: "gsuiPopup-row" },
				GSUcreateDiv( { class: "gsuiPopup-row-title" }, "Password" ),
				GSUcreateDiv( { class: "gsuiPopup-row-values" },
					GSUcreateInput( { class: "gsuiPopup-inputText", required: true, name: "password", type: "password" } ),
				),
			),
			GSUcreateDiv( { class: "gsuiDAW-popup-auth-error" } ),
		),
		GSUcreateAExt( { href: "https://gridsound.com/#/forgotPassword" }, "Forgot password ?" ),
		GSUcreateElement( "br" ),
		GSUcreateAExt( { href: "https://gridsound.com/#/auth" }, "Create a new account" ),
	)
);
