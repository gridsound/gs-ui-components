"use strict";

GSUsetTemplate( "gsui-popup", () => [
	GSUcreateDiv( { class: "gsuiPopup-overlay" } ),
	GSUcreateDiv( { class: "gsuiPopup-window", tabindex: 0 },
		GSUcreateDiv( { class: "gsuiPopup-head" } ),
		GSUcreateElement( "form", { class: "gsuiPopup-body" },
			GSUcreateDiv( { class: "gsuiPopup-content" } ),
			GSUcreateDiv( { class: "gsuiPopup-message" } ),
			GSUcreateInput( { class: "gsuiPopup-inputText", type: "text" } ),
			GSUcreateDiv( { class: "gsuiPopup-btns" },
				GSUcreateElement( "gsui-com-button", { class: "gsuiPopup-cancel", text: "Cancel" } ),
				GSUcreateElement( "gsui-com-button", { class: "gsuiPopup-ok", text: "Ok", type: "submit" } ),
			),
		),
	)
] );
