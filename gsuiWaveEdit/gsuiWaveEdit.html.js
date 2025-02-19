"use strict";

GSUsetTemplate( "gsui-wave-edit", () => [
	GSUcreateDiv( { class: "gsuiWaveEdit-graph" },
		GSUcreateDiv( { class: "gsuiWaveEdit-graph-lineX" } ),
		GSUcreateElement( "gsui-dotline" ),
	),
	GSUcreateSpan( { class: "gsuiWaveEdit-title", inert: true }, "wave-edition" ),
] );
