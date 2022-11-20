"use strict";

GSUI.$setTemplate( "gsui-fx-delay", () => [
	GSUI.$createElement( "div", { class: "gsuiFxDelay-param", "data-prop": "time" },
		GSUI.$createElement( "gsui-slider", { type: "linear-x", step: .01, min: 0, max: 2 } ),
		GSUI.$createElement( "span", { class: "gsuiFxDelay-param-value" } ),
	),
	GSUI.$createElement( "div", { class: "gsuiFxDelay-param", "data-prop": "gain" },
		GSUI.$createElement( "gsui-slider", { type: "linear-x", step: .01, min: 0, max: 1 } ),
		GSUI.$createElement( "span", { class: "gsuiFxDelay-param-value" } ),
	),
	GSUI.$createElement( "div", { class: "gsuiFxDelay-param", "data-prop": "pan" },
		GSUI.$createElement( "gsui-slider", { type: "linear-x", step: .01, min: -1, max: 1 } ),
		GSUI.$createElement( "span", { class: "gsuiFxDelay-param-value" } ),
	),
] );
