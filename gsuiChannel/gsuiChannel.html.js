"use strict";

GSUsetTemplate( "gsui-channel", () => [
	GSUcreateButton( { class: "gsuiChannel-nameWrap" },
		GSUcreateSpan( { class: "gsuiChannel-name" } ),
	),
	GSUcreateButton( { class: "gsuiChannel-headBtn gsuiChannel-rename", icon: "pen", title: "Rename the channel" } ),
	GSUcreateButton( { class: "gsuiChannel-headBtn gsuiChannel-delete", icon: "close", title: "Remove the channel" } ),
	GSUcreateDiv( { class: "gsuiChannel-analyser" },
		GSUcreateElement( "gsui-analyser-hist" ),
		GSUcreateDiv( { class: "gsuiChannel-effects" } ),
	),
	GSUcreateElement( "gsui-toggle" ),
	GSUcreateDiv( { class: "gsuiChannel-pan" },
		GSUcreateElement( "gsui-slider", { type: "circular", min: -1, max: 1, step: .02, "mousemove-size": 800, "stroke-width": 3, "data-prop": "pan", defaultValue: 0 } ),
	),
	GSUcreateDiv( { class: "gsuiChannel-gain" },
		GSUcreateElement( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 400, "data-prop": "gain", defaultValue: 1 } ),
	),
	GSUcreateButton( { class: "gsuiChannel-connect" },
		GSUcreateIcon( { class: "gsuiChannel-connectA", icon: "caret-up" } ),
		GSUcreateIcon( { class: "gsuiChannel-connectB", icon: "caret-up" } ),
	),
	GSUcreateDiv( { class: "gsuiChannel-grip gsuiIcon", "data-icon": "grip-h" } ),
] );

GSUsetTemplate( "gsui-channel-effect", ( id, name ) =>
	GSUcreateButton( { class: "gsuiChannel-effect", "data-id": id, "data-enable": true },
		GSUcreateSpan( { class: "gsuiChannel-effect-name" }, name ),
	),
);
