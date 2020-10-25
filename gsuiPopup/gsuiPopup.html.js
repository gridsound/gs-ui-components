"use strict";

GSUI.setTemplate( "gsui-popup", () => (
	GSUI.createElement( "div", { id: "gsuiPopup" },
		GSUI.createElement( "div", { id: "gsuiPopupWindow", tabindex: 0 },
			GSUI.createElement( "div", { id: "gsuiPopupHead" } ),
			GSUI.createElement( "form", { id: "gsuiPopupBody" },
				GSUI.createElement( "div", { id: "gsuiPopupContent" } ),
				GSUI.createElement( "div", { id: "gsuiPopupMessage" } ),
				GSUI.createElement( "input", { id: "gsuiPopupInputText", type: "text" } ),
				GSUI.createElement( "div", { id: "gsuiPopupBtns" },
					GSUI.createElement( "input", { type: "button", id: "gsuiPopupCancel", value: "Cancel" } ),
					GSUI.createElement( "input", { type: "submit", id: "gsuiPopupOk", value: "Ok" } ),
				),
			),
		),
	)
) );
