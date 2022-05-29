"use strict";

GSUI.$setTemplate( "gsui-popup", () =>
	GSUI.$createElement( "div", { class: "gsuiPopup-window", tabindex: 0 },
		GSUI.$createElement( "div", { class: "gsuiPopup-head" } ),
		GSUI.$createElement( "form", { class: "gsuiPopup-body" },
			GSUI.$createElement( "div", { class: "gsuiPopup-content" } ),
			GSUI.$createElement( "div", { class: "gsuiPopup-message" } ),
			GSUI.$createElement( "input", { class: "gsuiPopup-inputText", type: "text" } ),
			GSUI.$createElement( "div", { class: "gsuiPopup-btns" },
				GSUI.$createElement( "input", { type: "button", class: "gsuiPopup-cancel", value: "Cancel" } ),
				GSUI.$createElement( "input", { type: "submit", class: "gsuiPopup-ok", value: "Ok" } ),
			),
		),
	)
);
