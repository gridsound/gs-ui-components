"use strict";

GSUsetTemplate( "gsui-daw-window-main", () =>
	GSUcreateElement( "div", { "data-window": "main" } )
);

GSUsetTemplate( "gsui-daw-window-piano", () =>
	GSUcreateElement( "div", { "data-window": "piano" },
		GSUcreateElement( "div", { class: "gsuiDAW-winMenu" },
			GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "pianoroll" } ),
		),
	)
);

GSUsetTemplate( "gsui-daw-window-synth", () =>
	GSUcreateElement( "div", { "data-window": "synth" },
		GSUcreateElement( "div", { class: "gsuiDAW-winMenu" },
			GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "synth" } ),
			GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "arrow-right" } ),
			GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "synthChannel" },
				GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "mixer" } ),
				GSUcreateElement( "span" ),
			),
		),
	)
);

GSUsetTemplate( "gsui-daw-window-mixer", () =>
	GSUcreateElement( "div", { "data-window": "mixer" } )
);

GSUsetTemplate( "gsui-daw-window-effects", () =>
	GSUcreateElement( "div", { "data-window": "effects" },
		GSUcreateElement( "div", { class: "gsuiDAW-winMenu" },
			GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "channel" } ),
		),
	)
);

GSUsetTemplate( "gsui-daw-window-drums", () =>
	GSUcreateElement( "div", { "data-window": "drums" },
		GSUcreateElement( "div", { class: "gsuiDAW-winMenu" },
			GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "drums" } ),
		),
	)
);

GSUsetTemplate( "gsui-daw-window-slicer", () =>
	GSUcreateElement( "div", { "data-window": "slicer" },
		GSUcreateElement( "div", { class: "gsuiDAW-winMenu" },
			GSUcreateButton( { class: "gsuiDAW-winBtn", "data-target": "slices" } ),
		),
	)
);
