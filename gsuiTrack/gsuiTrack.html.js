"use strict";

GSUI.setTemplate( "gsui-track", () => [
	GSUI.createElem( "button", { class: "gsuiTrack-toggle gsuiIcon", "data-action": "toggle", "data-icon": "toggle", title: "toggle track" } ),
	GSUI.createElem( "div", { class: "gsuiTrack-nameWrap" },
		GSUI.createElem( "input", { class: "gsuiTrack-name", "data-action": "rename", type: "text", disabled: "", spellcheck: "false" } ),
	),
] );

GSUI.setTemplate( "gsui-track-row", () =>
	GSUI.createElem( "div", { class: "gsuiTrack-row gsui-row gsui-mute" },
		GSUI.createElem( "div" ),
	)
);
