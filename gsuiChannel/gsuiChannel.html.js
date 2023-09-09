"use strict";

GSUsetTemplate( "gsui-channel", () => [
	GSUcreateButton( { class: "gsuiChannel-nameWrap" },
		GSUcreateElement( "span", { class: "gsuiChannel-name" } ),
	),
	GSUcreateButton( { class: "gsuiChannel-headBtn gsuiChannel-rename gsuiIcon", "data-icon": "pen", title: "Rename the channel" } ),
	GSUcreateButton( { class: "gsuiChannel-headBtn gsuiChannel-delete gsuiIcon", "data-icon": "close", title: "Remove the channel" } ),
	GSUcreateElement( "div", { class: "gsuiChannel-analyser" },
		GSUcreateElement( "gsui-analyser" ),
		GSUcreateElement( "div", { class: "gsuiChannel-effects" } ),
	),
	GSUcreateElement( "gsui-toggle" ),
	GSUcreateElement( "div", { class: "gsuiChannel-pan" },
		GSUcreateElement( "gsui-slider", { type: "circular", min: -1, max: 1, step: .02, "mousemove-size": 800, "stroke-width": 3, "data-prop": "pan" } ),
	),
	GSUcreateElement( "div", { class: "gsuiChannel-gain" },
		GSUcreateElement( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 400, "data-prop": "gain" } ),
	),
	GSUcreateButton( { class: "gsuiChannel-connect" },
		GSUcreateElement( "i", { class: "gsuiChannel-connectA gsuiIcon", "data-icon": "caret-up" } ),
		GSUcreateElement( "i", { class: "gsuiChannel-connectB gsuiIcon", "data-icon": "caret-up" } ),
	),
	GSUcreateElement( "div", { class: "gsuiChannel-grip gsuiIcon", "data-icon": "grip-h" } ),
] );

GSUsetTemplate( "gsui-channel-effect", ( id, name ) =>
	GSUcreateButton( { class: "gsuiChannel-effect gsuiChannel-effect-enable", "data-id": id },
		GSUcreateElement( "span", { class: "gsuiChannel-effect-name" }, name ),
	),
);
