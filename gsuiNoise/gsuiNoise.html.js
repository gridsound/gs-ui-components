"use strict";

GSUsetTemplate( "gsui-noise", txt => [
	GSUcreateSpan( { class: "gsuiNoise-type" }, "white noise" ),
	GSUcreateElement( "gsui-slider", { type: "linear-x", min: 0, max: 1, step: .001 } ),
	GSUcreateSpan( { class: "gsuiNoise-value" }, 0 ),
] );
