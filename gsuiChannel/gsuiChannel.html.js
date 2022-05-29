"use strict";

GSUI.$setTemplate( "gsui-channel", () => [
	GSUI.$createElement( "button", { class: "gsuiChannel-nameWrap" },
		GSUI.$createElement( "span", { class: "gsuiChannel-name" } ),
	),
	GSUI.$createElement( "button", { class: "gsuiChannel-delete gsuiIcon", "data-icon": "close", title: "Remove the channel" } ),
	GSUI.$createElement( "gsui-analyser" ),
	GSUI.$createElement( "button", { class: "gsuiChannel-toggle gsuiIcon", "data-icon": "toggle" } ),
	GSUI.$createElement( "div", { class: "gsuiChannel-pan" },
		GSUI.$createElement( "gsui-slider", { type: "circular", min: -1, max: 1, step: .02, "mousemove-size": 800, "stroke-width": 3, "data-prop": "pan" } ),
	),
	GSUI.$createElement( "div", { class: "gsuiChannel-gain" },
		GSUI.$createElement( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 400, "data-prop": "gain" } ),
	),
	GSUI.$createElement( "button", { class: "gsuiChannel-connect" },
		GSUI.$createElement( "i", { class: "gsuiChannel-connectA gsuiIcon", "data-icon": "caret-up" } ),
		GSUI.$createElement( "i", { class: "gsuiChannel-connectB gsuiIcon", "data-icon": "caret-up" } ),
	),
	GSUI.$createElement( "div", { class: "gsuiChannel-grip gsuiIcon", "data-icon": "grip-h" } ),
] );
