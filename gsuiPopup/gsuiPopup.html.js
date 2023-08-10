"use strict";

GSUsetTemplate( "gsui-popup", () =>
	GSUcreateElement( "div", { class: "gsuiPopup-window", tabindex: 0 },
		GSUcreateElement( "div", { class: "gsuiPopup-head" } ),
		GSUcreateElement( "form", { class: "gsuiPopup-body" },
			GSUcreateElement( "div", { class: "gsuiPopup-content" } ),
			GSUcreateElement( "div", { class: "gsuiPopup-message" } ),
			GSUcreateElement( "input", { class: "gsuiPopup-inputText", type: "text" } ),
			GSUcreateElement( "div", { class: "gsuiPopup-btns" },
				GSUcreateElement( "input", { type: "button", class: "gsuiPopup-cancel", value: "Cancel" } ),
				GSUcreateElement( "input", { type: "submit", class: "gsuiPopup-ok", value: "Ok" } ),
			),
		),
	)
);
