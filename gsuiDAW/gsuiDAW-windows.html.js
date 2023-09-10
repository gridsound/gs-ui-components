"use strict";

GSUsetTemplate( "gsui-daw-window-main", () =>
	GSUcreateDiv( { "data-window": "main" } )
);

GSUsetTemplate( "gsui-daw-window-piano", () =>
	GSUcreateDiv( { "data-window": "piano" },
		GSUcreateDiv( { class: "gsuiDAW-winMenu" },
			GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "pianoroll" } ),
		),
	)
);

GSUsetTemplate( "gsui-daw-window-synth", () =>
	GSUcreateDiv( { "data-window": "synth" },
		GSUcreateDiv( { class: "gsuiDAW-winMenu" },
			GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "synth" } ),
			GSUcreateI( { class: "gsuiIcon", "data-icon": "arrow-right" } ),
			GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "synthChannel" },
				GSUcreateI( { class: "gsuiIcon", "data-icon": "mixer" } ),
				GSUcreateSpan(),
			),
		),
	)
);

GSUsetTemplate( "gsui-daw-window-mixer", () =>
	GSUcreateDiv( { "data-window": "mixer" } )
);

GSUsetTemplate( "gsui-daw-window-effects", () =>
	GSUcreateDiv( { "data-window": "effects" },
		GSUcreateDiv( { class: "gsuiDAW-winMenu" },
			GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "channel" } ),
		),
	)
);

GSUsetTemplate( "gsui-daw-window-drums", () =>
	GSUcreateDiv( { "data-window": "drums" },
		GSUcreateDiv( { class: "gsuiDAW-winMenu" },
			GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "drums" } ),
		),
	)
);

GSUsetTemplate( "gsui-daw-window-slicer", () =>
	GSUcreateDiv( { "data-window": "slicer" },
		GSUcreateDiv( { class: "gsuiDAW-winMenu" },
			GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "slices" } ),
		),
	)
);
