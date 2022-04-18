"use strict";

GSUI.setTemplate( "gsui-daw-popup-auth", () =>
	GSUI.createElem( "div", { id: "authPopupContent", class: "gsuiDAW-popup-auth" },
		GSUI.createElem( "fieldset", null,
			GSUI.createElem( "legend", null, "Sign in" ),
			GSUI.createElem( "div", { class: "gsuiPopup-row" },
				GSUI.createElem( "div", { class: "gsuiPopup-row-title" },
					GSUI.createElem( "span", null, "Username" ),
					GSUI.createElem( "br" ),
					GSUI.createElem( "small", null, "(or email)" ),
				),
				GSUI.createElem( "div", { class: "gsuiPopup-row-values" },
					GSUI.createElem( "input", { class: "gsuiPopup-inputText", required: true, name: "email", type: "text" } ),
				),
			),
			GSUI.createElem( "div", { class: "gsuiPopup-row" },
				GSUI.createElem( "div", { class: "gsuiPopup-row-title" }, "Password" ),
				GSUI.createElem( "div", { class: "gsuiPopup-row-values" },
					GSUI.createElem( "input", { class: "gsuiPopup-inputText", required: true, name: "password", type: "password" } ),
				),
			),
			GSUI.createElem( "div", { class: "gsuiDAW-popup-auth-error" } ),
		),
		GSUI.createElem( "a", { target: "_blank", rel: "noopener", href: "https://gridsound.com/#/forgotPassword" }, "Forgot password ?" ),
		GSUI.createElem( "br" ),
		GSUI.createElem( "a", { target: "_blank", rel: "noopener", href: "https://gridsound.com/#/auth" }, "Create a new account" ),
	)
);
