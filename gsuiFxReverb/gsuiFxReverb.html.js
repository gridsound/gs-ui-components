"use strict";

GSUsetTemplate( "gsui-fx-reverb", () => [
	GSUcreateDiv( { class: "gsuiEffect-param-row", "data-prop": "dry" },
		GSUcreateSpan( { class: "gsuiEffect-param-label" }, "dry" ),
		GSUcreateElement( "gsui-slider", { type: "linear-x", min: 0, max: 1, step: .01 } ),
		GSUcreateSpan( { class: "gsuiEffect-param-value" } ),
	),
	GSUcreateDiv( { class: "gsuiEffect-param-row", "data-prop": "wet" },
		GSUcreateSpan( { class: "gsuiEffect-param-label" }, "wet" ),
		GSUcreateElement( "gsui-slider", { type: "linear-x", min: 0, max: 1, step: .01 } ),
		GSUcreateSpan( { class: "gsuiEffect-param-value" } ),
	),
	GSUcreateDiv( { class: "gsuiFxReverb-graph" } ),
] );
