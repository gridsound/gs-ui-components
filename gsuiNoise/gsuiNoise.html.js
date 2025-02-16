"use strict";

GSUsetTemplate( "gsui-noise", txt => [
	GSUcreateDiv( { class: "gsuiNoise-type" },
		GSUcreateDiv( { class: "gsuiNoise-type-color" } ),
		GSUcreateSpan( { class: "gsuiNoise-type-txt" }, "white" ),
		GSUcreateSelect( { class: "gsuiNoise-type-select" },
			GSUcreateOption( { value: "white" } ),
			GSUcreateOption( { value: "pink" } ),
			GSUcreateOption( { value: "brown" } ),
		),
	),
	GSUcreateElement( "gsui-slider", { "data-prop": "gain", type: "linear-x", min: 0, max: 1, step: .001, "mousemove-size": 400 } ),
	GSUcreateSpan( { class: "gsuiNoise-value", "data-prop": "gain" } ),
	GSUcreateSpan( null, "pan" ),
	GSUcreateElement( "gsui-slider", { "data-prop": "pan", type: "linear-x", min: -1, max: 1, step: .001, "mousemove-size": 400 } ),
	GSUcreateSpan( { class: "gsuiNoise-value", "data-prop": "pan" } ),
] );
