"use strict";

GSUsetTemplate( "gsui-wave-edit", () => [
	GSUcreateSpan( { class: "gsuiWaveEdit-head" },
		GSUcreateButton( { class: "gsuiWaveEdit-back gsuiIcon", "data-action": "back", "data-icon": "arrow-left" } ),
		GSUcreateSpan( { class: "gsuiWaveEdit-title", inert: true }, "wave-edition" ),
	),
	GSUcreateDiv( { class: "gsuiWaveEdit-graph" },
		GSUcreateElement( "gsui-dotline", { beatlines: true, viewbox: "0 -1 1 1", xstep: 1 / 128, ystep: 1 / 16 } ),
	),
] );
