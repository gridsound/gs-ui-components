"use strict";

GSUsetTemplate( "gsui-daw-windowHeads", () => [
	GSUcreateDiv( { "data-window": "composition" },
		GSUgetTemplate( "gsui-daw-window-playPause" ),
	),
	GSUcreateDiv( { "data-window": "keys" },
		GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "pianoroll" } ),
		GSUgetTemplate( "gsui-daw-window-playPause" ),
	),
	GSUcreateDiv( { "data-window": "synth" },
		GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "synth" } ),
		GSUcreateI( { class: "gsuiIcon", "data-icon": "arrow-right", inert: true } ),
		GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "synthChannel" },
			GSUcreateI( { class: "gsuiIcon", "data-icon": "mixer" } ),
			GSUcreateSpan(),
		),
	),
	GSUcreateDiv( { "data-window": "mixer" } ),
	GSUcreateDiv( { "data-window": "effects" },
		GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "channel" } ),
	),
	GSUcreateDiv( { "data-window": "drums" },
		GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "drums" } ),
		GSUgetTemplate( "gsui-daw-window-playPause" ),
	),
	GSUcreateDiv( { "data-window": "slices" },
		GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "slices" } ),
		GSUgetTemplate( "gsui-daw-window-playPause" ),
	),
] );

GSUsetTemplate( "gsui-daw-window-playPause", () =>
	GSUcreateDiv( { "class": "gsuiDAW-window-playPause" },
		GSUcreateButton( { class: "gsuiIcon", "data-action": "play", "data-icon": "play" } ),
		GSUcreateButton( { class: "gsuiIcon", "data-action": "stop", "data-icon": "stop" } ),
	)
);
