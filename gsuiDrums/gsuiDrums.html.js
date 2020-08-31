"use strict";

GSUI.setTemplate( "gsui-drums", () => (
	GSUI.createElement( "div", { class: "gsuiDrums", tabindex: "-1" },
		GSUI.createElement( "div", { class: "gsuiDrums-panels gsuiPanels-x" },
			GSUI.createElement( "div", { class: "gsuiDrums-sidePanel" },
				GSUI.createElement( "div", { class: "gsuiDrums-sidePanelMenu" } ),
			),
			GSUI.createElement( "div", { class: "gsuiDrums-linesPanel" },
				GSUI.createElement( "div", { class: "gsuiDrums-timelineWrap" } ),
				GSUI.createElement( "div", { class: "gsuiDrums-lines" },
					GSUI.createElement( "div", { class: "gsuiDrums-linesAbsolute" },
						GSUI.createElement( "gsui-beatlines", { coloredbeats: "" } ),
						GSUI.createElement( "div", { class: "gsuiDrums-currentTime" } ),
						GSUI.createElement( "div", { class: "gsuiDrums-loop gsuiDrums-loopA" } ),
						GSUI.createElement( "div", { class: "gsuiDrums-loop gsuiDrums-loopB" } ),
					),
					GSUI.createElement( "div", { class: "gsuiDrums-drumHover" },
						GSUI.createElement( "div", { class: "gsuiDrums-drumHoverIn" } ),
					),
					GSUI.createElement( "div", { class: "gsuiDrums-drumcutHover" },
						GSUI.createElement( "div", { class: "gsuiDrums-drumcutHoverIn" } ),
					),
				),
			),
		),
		GSUI.createElement( "div", { class: "gsuiDrums-shadow" } ),
	)
) );

GSUI.setTemplate( "gsui-drums-line", () => (
	GSUI.createElement( "div", { class: "gsuiDrums-line" },
		GSUI.createElement( "div", { class: "gsuiDrums-lineDrums" },
			GSUI.createElement( "div", { class: "gsuiDrums-lineIn" } ),
		),
		GSUI.createElement( "div", { class: "gsuiDrums-lineProps" },
			GSUI.createElement( "gsui-slidergroup" ),
		),
	)
) );

GSUI.setTemplate( "gsui-drums-drum", () => (
	GSUI.createElement( "div", { class: "gsuiDrums-drum" },
		GSUI.createElement( "div", { class: "gsuiDrums-drumIn" },
			[ "detune", "pan", "gain" ].map( p => (
				GSUI.createElement( "div", { class: "gsuiDrums-drumProp", "data-value": p },
					GSUI.createElement( "div", { class: "gsuiDrums-drumPropValue" } ),
				)
			) ),
		),
	)
) );

GSUI.setTemplate( "gsui-drums-drumcut", () => (
	GSUI.createElement( "div", { class: "gsuiDrums-drumcut" },
		GSUI.createElement( "div", { class: "gsuiDrums-drumcutIn" },
			GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "drumcut" } ),
		),
	)
) );
