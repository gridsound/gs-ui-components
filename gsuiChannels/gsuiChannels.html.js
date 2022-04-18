"use strict";

GSUI.setTemplate( "gsui-channels", () => [
	GSUI.createElem( "div", { class: "gsuiChannels-panMain" } ),
	GSUI.createElem( "div", { class: "gsuiChannels-panChannels" },
		GSUI.createElem( "button", { class: "gsuiChannels-addChan" },
			GSUI.createElem( "i", { class: "gsuiIcon", "data-icon": "plus" } ),
		),
	),
] );

GSUI.setTemplate( "gsui-channels-selectPopup", () =>
	GSUI.createElem( "div", null,
		GSUI.createElem( "fieldset", null,
			GSUI.createElem( "legend", null, "Select a channel" ),
			GSUI.createElem( "select", { name: "channel", size: 8 } ),
		),
	)
);
