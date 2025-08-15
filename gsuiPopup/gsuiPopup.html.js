"use strict";

GSUsetTemplate( "gsui-popup", () => [
	GSUcreateElement( "dialog", { class: "gsuiPopup-window" },
		GSUcreateDiv( { class: "gsuiPopup-head" } ),
		GSUcreateElement( "form", { class: "gsuiPopup-body" },
			GSUcreateDiv( { class: "gsuiPopup-content" } ),
			GSUcreateDiv( { class: "gsuiPopup-message" } ),
			GSUcreateInput( { class: "gsuiPopup-inputText", type: "text" } ),
			GSUcreateFlex( { x: true, xcenter: true, g10: true },
				GSUcreateElement( "gsui-com-button", { class: "gsuiPopup-cancel", text: "Cancel" } ),
				GSUcreateElement( "gsui-com-button", { class: "gsuiPopup-ok", text: "Ok", type: "submit" } ),
			),
		),
	)
] );
