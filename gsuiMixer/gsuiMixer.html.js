"use strict";

GSUI.setTemplate( "gsui-mixer", () => (
	GSUI.createElement( "div", { class: "gsuiMixer" },
		GSUI.createElement( "div", { class: "gsuiMixer-panMain" } ),
		GSUI.createElement( "div", { class: "gsuiMixer-panChannels" },
			GSUI.createElement( "button", { class: "gsuiMixer-addChan" },
				GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "plus" } ),
			),
		),
	)
) );

GSUI.setTemplate( "gsui-mixer-channel", () => (
	GSUI.createElement( "div", { class: "gsuiMixerChannel", draggable: "true" },
		GSUI.createElement( "button", { class: "gsuiMixerChannel-nameWrap" },
			GSUI.createElement( "span", { class: "gsuiMixerChannel-name" } ),
		),
		GSUI.createElement( "button", { class: "gsuiMixerChannel-delete gsuiIcon", "data-icon": "close", title: "Remove the channel" } ),
		GSUI.createElement( "div", { class: "gsuiMixerChannel-analyserWrap" },
			GSUI.createElement( "canvas", { class: "gsuiMixerChannel-analyser" } ),
		),
		GSUI.createElement( "button", { class: "gsuiMixerChannel-toggle gsuiIcon", "data-icon": "toggle" } ),
		GSUI.createElement( "div", { class: "gsuiMixerChannel-pan" },
			GSUI.createElement( "gsui-slider", { type: "circular", min: -1, max: 1, step: .02, "mousemove-size": 800, "stroke-width": 3 } ),
		),
		GSUI.createElement( "div", { class: "gsuiMixerChannel-gain" },
			GSUI.createElement( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 400 } ),
		),
		GSUI.createElement( "button", { class: "gsuiMixerChannel-connect" },
			GSUI.createElement( "i", { class: "gsuiMixerChannel-connectA gsuiIcon", "data-icon": "caret-up" } ),
			GSUI.createElement( "i", { class: "gsuiMixerChannel-connectB gsuiIcon", "data-icon": "caret-up" } ),
		),
		GSUI.createElement( "div", { class: "gsuiMixerChannel-grip gsuiIcon", "data-icon": "grip-h" } ),
	)
) );
