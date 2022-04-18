"use strict";

GSUI.setTemplate( "gsui-daw-window-blocks", () =>
	GSUI.createElem( "div", { "data-window": "blocks" } )
);

GSUI.setTemplate( "gsui-daw-window-main", () =>
	GSUI.createElem( "div", { "data-window": "main" } )
);

GSUI.setTemplate( "gsui-daw-window-piano", () =>
	GSUI.createElem( "div", { "data-window": "piano" },
		GSUI.createElem( "div", { class: "gsuiDAW-winMenu" },
			GSUI.createElem( "button", { class: "gsuiDAW-winBtn", "data-target": "pianoroll" } ),
		),
	)
);

GSUI.setTemplate( "gsui-daw-window-synth", () =>
	GSUI.createElem( "div", { "data-window": "synth" },
		GSUI.createElem( "div", { class: "gsuiDAW-winMenu" },
			GSUI.createElem( "button", { class: "gsuiDAW-winBtn", "data-target": "synth" } ),
			GSUI.createElem( "i", { class: "gsuiIcon", "data-icon": "arrow-right" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-winBtn", "data-target": "synthChannel" },
				GSUI.createElem( "i", { class: "gsuiIcon", "data-icon": "mixer" } ),
				GSUI.createElem( "span" ),
			),
		),
	)
);

GSUI.setTemplate( "gsui-daw-window-mixer", () =>
	GSUI.createElem( "div", { "data-window": "mixer" } )
);

GSUI.setTemplate( "gsui-daw-window-effects", () =>
	GSUI.createElem( "div", { "data-window": "effects" },
		GSUI.createElem( "div", { class: "gsuiDAW-winMenu" },
			GSUI.createElem( "button", { class: "gsuiDAW-winBtn", "data-target": "channel" } ),
		),
	)
);

GSUI.setTemplate( "gsui-daw-window-drums", () =>
	GSUI.createElem( "div", { "data-window": "drums" },
		GSUI.createElem( "div", { class: "gsuiDAW-winMenu" },
			GSUI.createElem( "button", { class: "gsuiDAW-winBtn", "data-target": "drums" } ),
		),
	)
);

GSUI.setTemplate( "gsui-daw-window-slicer", () =>
	GSUI.createElem( "div", { "data-window": "slicer" },
		GSUI.createElem( "div", { class: "gsuiDAW-winMenu" },
			GSUI.createElem( "button", { class: "gsuiDAW-winBtn", "data-target": "slices" } ),
		),
	)
);
