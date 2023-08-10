"use strict";

GSUsetTemplate( "gsui-daw-popup-auth", () =>
	GSUcreateElement( "div", { id: "authPopupContent", class: "gsuiDAW-popup-auth" },
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Sign in" ),
			GSUcreateElement( "div", { class: "gsuiPopup-row" },
				GSUcreateElement( "div", { class: "gsuiPopup-row-title" },
					GSUcreateElement( "span", null, "Username" ),
					GSUcreateElement( "br" ),
					GSUcreateElement( "small", null, "(or email)" ),
				),
				GSUcreateElement( "div", { class: "gsuiPopup-row-values" },
					GSUcreateElement( "input", { class: "gsuiPopup-inputText", required: true, name: "email", type: "text" } ),
				),
			),
			GSUcreateElement( "div", { class: "gsuiPopup-row" },
				GSUcreateElement( "div", { class: "gsuiPopup-row-title" }, "Password" ),
				GSUcreateElement( "div", { class: "gsuiPopup-row-values" },
					GSUcreateElement( "input", { class: "gsuiPopup-inputText", required: true, name: "password", type: "password" } ),
				),
			),
			GSUcreateElement( "div", { class: "gsuiDAW-popup-auth-error" } ),
		),
		GSUcreateElement( "a", { target: "_blank", rel: "noopener", href: "https://gridsound.com/#/forgotPassword" }, "Forgot password ?" ),
		GSUcreateElement( "br" ),
		GSUcreateElement( "a", { target: "_blank", rel: "noopener", href: "https://gridsound.com/#/auth" }, "Create a new account" ),
	)
);
