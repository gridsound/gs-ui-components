"use strict";

GSUI.setTemplate( "gsui-channel", () => [
	GSUI.createElem( "button", { class: "gsuiChannel-nameWrap" },
		GSUI.createElem( "span", { class: "gsuiChannel-name" } ),
	),
	GSUI.createElem( "button", { class: "gsuiChannel-delete gsuiIcon", "data-icon": "close", title: "Remove the channel" } ),
	GSUI.createElem( "gsui-analyser" ),
	GSUI.createElem( "button", { class: "gsuiChannel-toggle gsuiIcon", "data-icon": "toggle" } ),
	GSUI.createElem( "div", { class: "gsuiChannel-pan" },
		GSUI.createElem( "gsui-slider", { type: "circular", min: -1, max: 1, step: .02, "mousemove-size": 800, "stroke-width": 3, "data-prop": "pan" } ),
	),
	GSUI.createElem( "div", { class: "gsuiChannel-gain" },
		GSUI.createElem( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 400, "data-prop": "gain" } ),
	),
	GSUI.createElem( "button", { class: "gsuiChannel-connect" },
		GSUI.createElem( "i", { class: "gsuiChannel-connectA gsuiIcon", "data-icon": "caret-up" } ),
		GSUI.createElem( "i", { class: "gsuiChannel-connectB gsuiIcon", "data-icon": "caret-up" } ),
	),
	GSUI.createElem( "div", { class: "gsuiChannel-grip gsuiIcon", "data-icon": "grip-h" } ),
] );
