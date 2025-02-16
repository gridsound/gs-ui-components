"use strict";

GSUsetTemplate( "gsui-noise", txt => [
	GSUcreateSpan( { class: "gsuiNoise-type" }, "white noise" ),
	GSUcreateElement( "gsui-slider", { "data-prop": "gain", type: "linear-x", min: 0, max: 1, step: .001, "mousemove-size": 400 } ),
	GSUcreateSpan( { class: "gsuiNoise-value", "data-prop": "gain" } ),
	GSUcreateSpan( null, "pan" ),
	GSUcreateElement( "gsui-slider", { "data-prop": "pan", type: "linear-x", min: -1, max: 1, step: .001, "mousemove-size": 400 } ),
	GSUcreateSpan( { class: "gsuiNoise-value", "data-prop": "pan" } ),
] );
