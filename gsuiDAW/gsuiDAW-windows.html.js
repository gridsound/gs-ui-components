"use strict";

GSUI.$setTemplate( "gsui-daw-window-main", () =>
	GSUI.$createElement( "div", { "data-window": "main" } )
);

GSUI.$setTemplate( "gsui-daw-window-piano", () =>
	GSUI.$createElement( "div", { "data-window": "piano" },
		GSUI.$createElement( "div", { class: "gsuiDAW-winMenu" },
			GSUI.$createElement( "button", { class: "gsuiDAW-winBtn", "data-target": "pianoroll" } ),
		),
	)
);

GSUI.$setTemplate( "gsui-daw-window-synth", () =>
	GSUI.$createElement( "div", { "data-window": "synth" },
		GSUI.$createElement( "div", { class: "gsuiDAW-winMenu" },
			GSUI.$createElement( "button", { class: "gsuiDAW-winBtn", "data-target": "synth" } ),
			GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "arrow-right" } ),
			GSUI.$createElement( "button", { class: "gsuiDAW-winBtn", "data-target": "synthChannel" },
				GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "mixer" } ),
				GSUI.$createElement( "span" ),
			),
		),
	)
);

GSUI.$setTemplate( "gsui-daw-window-mixer", () =>
	GSUI.$createElement( "div", { "data-window": "mixer" } )
);

GSUI.$setTemplate( "gsui-daw-window-effects", () =>
	GSUI.$createElement( "div", { "data-window": "effects" },
		GSUI.$createElement( "div", { class: "gsuiDAW-winMenu" },
			GSUI.$createElement( "button", { class: "gsuiDAW-winBtn", "data-target": "channel" } ),
		),
	)
);

GSUI.$setTemplate( "gsui-daw-window-drums", () =>
	GSUI.$createElement( "div", { "data-window": "drums" },
		GSUI.$createElement( "div", { class: "gsuiDAW-winMenu" },
			GSUI.$createElement( "button", { class: "gsuiDAW-winBtn", "data-target": "drums" } ),
		),
	)
);

GSUI.$setTemplate( "gsui-daw-window-slicer", () =>
	GSUI.$createElement( "div", { "data-window": "slicer" },
		GSUI.$createElement( "div", { class: "gsuiDAW-winMenu" },
			GSUI.$createElement( "button", { class: "gsuiDAW-winBtn", "data-target": "slices" } ),
		),
	)
);
