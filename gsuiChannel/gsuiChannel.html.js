"use strict";

GSUsetTemplate( "gsui-channel", () => [
	GSUcreateButton( { class: "gsuiChannel-nameWrap" },
		GSUcreateSpan( { class: "gsuiChannel-name" } ),
	),
	GSUcreateButton( { class: "gsuiChannel-headBtn gsuiChannel-rename gsuiIcon", "data-icon": "pen", title: "Rename the channel" } ),
	GSUcreateButton( { class: "gsuiChannel-headBtn gsuiChannel-delete gsuiIcon", "data-icon": "close", title: "Remove the channel" } ),
	GSUcreateDiv( { class: "gsuiChannel-analyser" },
		GSUcreateElement( "gsui-analyser-hist" ),
		GSUcreateDiv( { class: "gsuiChannel-effects" } ),
	),
	GSUcreateElement( "gsui-toggle" ),
	GSUcreateDiv( { class: "gsuiChannel-pan" },
		GSUcreateElement( "gsui-slider", { type: "circular", min: -1, max: 1, step: .02, "mousemove-size": 800, "stroke-width": 3, "data-prop": "pan" } ),
	),
	GSUcreateDiv( { class: "gsuiChannel-gain" },
		GSUcreateElement( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 400, "data-prop": "gain" } ),
	),
	GSUcreateButton( { class: "gsuiChannel-connect" },
		GSUcreateI( { class: "gsuiChannel-connectA gsuiIcon", "data-icon": "caret-up" } ),
		GSUcreateI( { class: "gsuiChannel-connectB gsuiIcon", "data-icon": "caret-up" } ),
	),
	GSUcreateDiv( { class: "gsuiChannel-grip gsuiIcon", "data-icon": "grip-h" } ),
] );

GSUsetTemplate( "gsui-channel-effect", ( id, name ) =>
	GSUcreateButton( { class: "gsuiChannel-effect gsuiChannel-effect-enable", "data-id": id },
		GSUcreateSpan( { class: "gsuiChannel-effect-name" }, name ),
	),
);
