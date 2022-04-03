"use strict";

GSUI.setTemplate( "window-blocks", () => (
	GSUI.createElement( "div", { "data-window": "blocks" } )
) );

GSUI.setTemplate( "window-main", () => (
	GSUI.createElement( "div", { "data-window": "main" } )
) );

GSUI.setTemplate( "window-piano", () => (
	GSUI.createElement( "div", { "data-window": "piano" },
		GSUI.createElement( "div", { class: "windowMenu" },
			GSUI.createElement( "button", { id: "pianorollName", class: "windowBtn windowDataBtn" } ),
		),
	)
) );

GSUI.setTemplate( "window-synth", () => (
	GSUI.createElement( "div", { "data-window": "synth" },
		GSUI.createElement( "div", { class: "windowMenu" },
			GSUI.createElement( "button", { id: "synthName", class: "windowBtn windowDataBtn" } ),
			GSUI.createElement( "i", { id: "synthDestArrow", class: "gsuiIcon", "data-icon": "arrow-right" } ),
			GSUI.createElement( "button", { id: "synthChannelBtn", class: "windowBtn" },
				GSUI.createElement( "i", { class: "windowBtnIcon gsuiIcon", "data-icon": "mixer" } ),
				GSUI.createElement( "span", { id: "synthChannelBtnText", class: "windowBtnText" } ),
			),
		),
	)
) );

GSUI.setTemplate( "window-mixer", () => (
	GSUI.createElement( "div", { "data-window": "mixer" } )
) );

GSUI.setTemplate( "window-effects", () => (
	GSUI.createElement( "div", { "data-window": "effects" },
		GSUI.createElement( "div", { class: "windowMenu" },
			GSUI.createElement( "button", { id: "channelName", class: "windowBtn windowDataBtn" } ),
		),
	)
) );

GSUI.setTemplate( "window-drums", () => (
	GSUI.createElement( "div", { "data-window": "drums" },
		GSUI.createElement( "div", { class: "windowMenu" },
			GSUI.createElement( "button", { id: "drumsName", class: "windowBtn windowDataBtn" } ),
		),
	)
) );

GSUI.setTemplate( "window-slicer", () => (
	GSUI.createElement( "div", { "data-window": "slicer" },
		GSUI.createElement( "div", { class: "windowMenu" },
			GSUI.createElement( "button", { id: "slicesName", class: "windowBtn windowDataBtn" } ),
		),
	)
) );
