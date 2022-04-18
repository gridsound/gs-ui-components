"use strict";

GSUI.setTemplate( "gsui-popup", () =>
	GSUI.createElem( "div", { class: "gsuiPopup-window", tabindex: 0 },
		GSUI.createElem( "div", { class: "gsuiPopup-head" } ),
		GSUI.createElem( "form", { class: "gsuiPopup-body" },
			GSUI.createElem( "div", { class: "gsuiPopup-content" } ),
			GSUI.createElem( "div", { class: "gsuiPopup-message" } ),
			GSUI.createElem( "input", { class: "gsuiPopup-inputText", type: "text" } ),
			GSUI.createElem( "div", { class: "gsuiPopup-btns" },
				GSUI.createElem( "input", { type: "button", class: "gsuiPopup-cancel", value: "Cancel" } ),
				GSUI.createElem( "input", { type: "submit", class: "gsuiPopup-ok", value: "Ok" } ),
			),
		),
	)
);
