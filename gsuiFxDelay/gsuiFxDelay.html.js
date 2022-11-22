"use strict";

GSUI.$setTemplate( "gsui-fx-delay", () => [
	GSUI.$createElement( "div", { class: "gsuiFxDelay-param", "data-prop": "time" },
		GSUI.$createElement( "gsui-slider", { type: "linear-x", step: .01, min: 0, max: 2 } ),
		GSUI.$createElement( "span", { class: "gsuiFxDelay-param-value" } ),
	),
	GSUI.$createElement( "div", { class: "gsuiFxDelay-param", "data-prop": "gain" },
		GSUI.$createElement( "gsui-slider", { type: "linear-x", step: .01, min: 0, max: .95 } ),
		GSUI.$createElement( "span", { class: "gsuiFxDelay-param-value" } ),
	),
	GSUI.$createElement( "div", { class: "gsuiFxDelay-param", "data-prop": "pan" },
		GSUI.$createElement( "gsui-slider", { type: "linear-x", step: .01, min: -1, max: 1 } ),
		GSUI.$createElement( "span", { class: "gsuiFxDelay-param-value" } ),
	),
	GSUI.$createElement( "div", { class: "gsuiFxDelay-graph" },
		GSUI.$createElement( "div", { class: "gsuiFxDelay-graph-lines" },
			GSUI.$createElement( "gsui-beatlines", { timedivision: "4/4" } ),
			GSUI.$createElement( "div", { class: "gsuiFxDelay-graph-line" } ),
			GSUI.$createElement( "div", { class: "gsuiFxDelay-graph-source" } ),
		),
		Array.from( { length: 20 }, ( _, n ) => GSUI.$createElement( "div", { class: "gsuiFxDelay-graph-echo" } ) )
	),
] );
