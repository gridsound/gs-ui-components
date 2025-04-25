"use strict";

GSUsetTemplate( "gsui-wave-edit", () => [
	GSUcreateSpan( { class: "gsuiWaveEdit-head" },
		GSUcreateButton( { class: "gsuiWaveEdit-back gsuiIcon", "data-action": "back", "data-icon": "arrow-left", title: "Save and close wave edition" } ),
		GSUcreateSpan( { class: "gsuiWaveEdit-title", inert: true }, "wave-edition" ),
		GSUcreateElement( "gsui-help-link", { page: "synth-wave-edition" } ),
	),
	GSUcreateDiv( { class: "gsuiWaveEdit-body" },
		GSUcreateDiv( { class: "gsuiWaveEdit-wt-graph" },
			GSUcreateElement( "gsui-wavetable-graph" ),
		),
		GSUcreateDiv( { class: "gsuiWaveEdit-scroll" },
			GSUcreateDiv( { class: "gsuiWaveEdit-graph" },
				GSUcreateElement( "gsui-dotline", { beatlines: true, viewbox: "0 -1 1 1", xstep: 1 / 100, ystep: 1 / 50 } ),
			),
			GSUcreateDiv( { class: "gsuiWaveEdit-waves" } ),
		),
	),
	GSUcreateDiv( { class: "gsuiWaveEdit-wtpos" },
		GSUcreateElement( "gsui-dotline", { viewbox: "0 0 1 1", xstep: 1 / 100, ystep: 1 / 100 } ),
	),
] );

GSUsetTemplate( "gsui-wave-edit-wavestep", ( id, ind ) =>
	GSUcreateDiv( { class: "gsuiWaveEdit-wavestep", "data-id": id, "data-index": ind },
		GSUcreateElement( "gsui-dotlinesvg", { "data-action": "select" } ),
		GSUcreateDiv( { class: "gsuiWaveEdit-wavestep-head", "data-action": "select" },
			GSUcreateSpan( { class: "gsuiWaveEdit-wavestep-num", inert: true } ),
			GSUcreateDiv( { class: "gsuiWaveEdit-wavestep-btn gsuiIcon", "data-action": "clone", "data-icon": "clone", title: "Clone this wave" } ),
			GSUcreateDiv( { class: "gsuiWaveEdit-wavestep-btn gsuiIcon", "data-action": "remove", "data-icon": "close", title: "Remove this wave" } ),
		),
	),
);
