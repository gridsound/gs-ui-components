"use strict";

GSUI.$setTemplate( "gsui-daw-popup-auth", () =>
	GSUI.$createElement( "div", { id: "authPopupContent", class: "gsuiDAW-popup-auth" },
		GSUI.$createElement( "fieldset", null,
			GSUI.$createElement( "legend", null, "Sign in" ),
			GSUI.$createElement( "div", { class: "gsuiPopup-row" },
				GSUI.$createElement( "div", { class: "gsuiPopup-row-title" },
					GSUI.$createElement( "span", null, "Username" ),
					GSUI.$createElement( "br" ),
					GSUI.$createElement( "small", null, "(or email)" ),
				),
				GSUI.$createElement( "div", { class: "gsuiPopup-row-values" },
					GSUI.$createElement( "input", { class: "gsuiPopup-inputText", required: true, name: "email", type: "text" } ),
				),
			),
			GSUI.$createElement( "div", { class: "gsuiPopup-row" },
				GSUI.$createElement( "div", { class: "gsuiPopup-row-title" }, "Password" ),
				GSUI.$createElement( "div", { class: "gsuiPopup-row-values" },
					GSUI.$createElement( "input", { class: "gsuiPopup-inputText", required: true, name: "password", type: "password" } ),
				),
			),
			GSUI.$createElement( "div", { class: "gsuiDAW-popup-auth-error" } ),
		),
		GSUI.$createElement( "a", { target: "_blank", rel: "noopener", href: "https://gridsound.com/#/forgotPassword" }, "Forgot password ?" ),
		GSUI.$createElement( "br" ),
		GSUI.$createElement( "a", { target: "_blank", rel: "noopener", href: "https://gridsound.com/#/auth" }, "Create a new account" ),
	)
);
