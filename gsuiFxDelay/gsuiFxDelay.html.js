"use strict";

GSUsetTemplate( "gsui-fx-delay", () => [
	GSUcreateDiv( { class: "gsuiEffect-param-row", "data-prop": "time" },
		GSUcreateSpan( { class: "gsuiEffect-param-label" }, "time" ),
		GSUcreateElement( "gsui-slider", { type: "linear-x", step: .01, min: 0, max: 2 } ),
		GSUcreateSpan( { class: "gsuiEffect-param-value" } ),
	),
	GSUcreateDiv( { class: "gsuiEffect-param-row", "data-prop": "gain" },
		GSUcreateSpan( { class: "gsuiEffect-param-label" }, "gain" ),
		GSUcreateElement( "gsui-slider", { type: "linear-x", step: .01, min: 0, max: .95 } ),
		GSUcreateSpan( { class: "gsuiEffect-param-value" } ),
	),
	GSUcreateDiv( { class: "gsuiEffect-param-row", "data-prop": "pan" },
		GSUcreateSpan( { class: "gsuiEffect-param-label" }, "pan" ),
		GSUcreateElement( "gsui-slider", { type: "linear-x", step: .01, min: -1, max: 1 } ),
		GSUcreateSpan( { class: "gsuiEffect-param-value" } ),
	),
	GSUcreateDiv( { class: "gsuiFxDelay-graph" },
		GSUcreateDiv( { class: "gsuiFxDelay-graph-lines" },
			GSUcreateElement( "gsui-beatlines", { timedivision: "4/4", color: "#fff" } ),
			GSUcreateDiv( { class: "gsuiFxDelay-graph-line" } ),
			GSUcreateDiv( { class: "gsuiFxDelay-graph-source" } ),
		),
		Array.from( { length: 20 }, () => GSUcreateDiv( { class: "gsuiFxDelay-graph-echo" } ) )
	),
] );
