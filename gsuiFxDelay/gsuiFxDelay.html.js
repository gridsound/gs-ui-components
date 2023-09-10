"use strict";

GSUsetTemplate( "gsui-fx-delay", () => [
	GSUcreateDiv( { class: "gsuiFxDelay-param", "data-prop": "time" },
		GSUcreateElement( "gsui-slider", { type: "linear-x", step: .01, min: 0, max: 2 } ),
		GSUcreateSpan( { class: "gsuiFxDelay-param-value" } ),
	),
	GSUcreateDiv( { class: "gsuiFxDelay-param", "data-prop": "gain" },
		GSUcreateElement( "gsui-slider", { type: "linear-x", step: .01, min: 0, max: .95 } ),
		GSUcreateSpan( { class: "gsuiFxDelay-param-value" } ),
	),
	GSUcreateDiv( { class: "gsuiFxDelay-param", "data-prop": "pan" },
		GSUcreateElement( "gsui-slider", { type: "linear-x", step: .01, min: -1, max: 1 } ),
		GSUcreateSpan( { class: "gsuiFxDelay-param-value" } ),
	),
	GSUcreateDiv( { class: "gsuiFxDelay-graph" },
		GSUcreateDiv( { class: "gsuiFxDelay-graph-lines" },
			GSUcreateElement( "gsui-beatlines", { timedivision: "4/4" } ),
			GSUcreateDiv( { class: "gsuiFxDelay-graph-line" } ),
			GSUcreateDiv( { class: "gsuiFxDelay-graph-source" } ),
		),
		Array.from( { length: 20 }, ( _, n ) => GSUcreateDiv( { class: "gsuiFxDelay-graph-echo" } ) )
	),
] );
