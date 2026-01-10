"use strict";

GSUsetTemplate( "gsui-fx-delay", () => [
	GSUcreateDiv( { class: "gsuiEffect-param-row", "data-prop": "time" },
		GSUcreateLabel( null, "time" ),
		GSUcreateElement( "output" ),
		GSUcreateElement( "gsui-slider", { type: "linear-x", step: .01, min: 0, max: 2 } ),
	),
	GSUcreateDiv( { class: "gsuiEffect-param-row", "data-prop": "gain" },
		GSUcreateLabel( null, "gain" ),
		GSUcreateElement( "output" ),
		GSUcreateElement( "gsui-slider", { type: "linear-x", step: .01, min: 0, max: .95 } ),
	),
	GSUcreateDiv( { class: "gsuiEffect-param-row", "data-prop": "pan" },
		GSUcreateLabel( null, "pan" ),
		GSUcreateElement( "output" ),
		GSUcreateElement( "gsui-slider", { type: "linear-x", step: .01, min: -1, max: 1 } ),
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
