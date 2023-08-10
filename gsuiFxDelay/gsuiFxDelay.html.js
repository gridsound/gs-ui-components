"use strict";

GSUsetTemplate( "gsui-fx-delay", () => [
	GSUcreateElement( "div", { class: "gsuiFxDelay-param", "data-prop": "time" },
		GSUcreateElement( "gsui-slider", { type: "linear-x", step: .01, min: 0, max: 2 } ),
		GSUcreateElement( "span", { class: "gsuiFxDelay-param-value" } ),
	),
	GSUcreateElement( "div", { class: "gsuiFxDelay-param", "data-prop": "gain" },
		GSUcreateElement( "gsui-slider", { type: "linear-x", step: .01, min: 0, max: .95 } ),
		GSUcreateElement( "span", { class: "gsuiFxDelay-param-value" } ),
	),
	GSUcreateElement( "div", { class: "gsuiFxDelay-param", "data-prop": "pan" },
		GSUcreateElement( "gsui-slider", { type: "linear-x", step: .01, min: -1, max: 1 } ),
		GSUcreateElement( "span", { class: "gsuiFxDelay-param-value" } ),
	),
	GSUcreateElement( "div", { class: "gsuiFxDelay-graph" },
		GSUcreateElement( "div", { class: "gsuiFxDelay-graph-lines" },
			GSUcreateElement( "gsui-beatlines", { timedivision: "4/4" } ),
			GSUcreateElement( "div", { class: "gsuiFxDelay-graph-line" } ),
			GSUcreateElement( "div", { class: "gsuiFxDelay-graph-source" } ),
		),
		Array.from( { length: 20 }, ( _, n ) => GSUcreateElement( "div", { class: "gsuiFxDelay-graph-echo" } ) )
	),
] );
