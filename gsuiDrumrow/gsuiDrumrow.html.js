"use strict";

GSUsetTemplate( "gsui-drumrow", () => [
	GSUcreateDiv( { class: "gsuiDrumrow-grip" },
		GSUcreateI( { class: "gsuiIcon", "data-icon": "grip-v" } ),
	),
	GSUcreateDiv( { class: "gsuiDrumrow-main" },
		GSUcreateElement( "gsui-toggle", { title: "Toggle the drumrow (right click for solo)" } ),
		GSUcreateButton( { class: "gsuiIcon gsuiDrumrow-btnProps", "data-action": "props", "data-icon": "drumprops", title: "Expand props panel" } ),
		GSUcreateButton( { class: "gsuiIcon gsuiDrumrow-btnDelete", "data-action": "delete", "data-icon": "close", title: "Remove the drumrow" } ),
		GSUcreateSpan( { class: "gsuiDrumrow-name" } ),
		GSUcreateDiv( { class: "gsuiDrumrow-waveWrap" } ),
		GSUcreateDiv( { class: "gsuiDrumrow-detune", title: "pitch" },
			GSUcreateElement( "gsui-slider", { type: "linear-y", min: -12, max: 12, step: 1, "mousemove-size": 400, "data-prop": "detune" } ),
		),
		GSUcreateDiv( { class: "gsuiDrumrow-pan", title: "pan" },
			GSUcreateElement( "gsui-slider", { type: "linear-y", min: -1, max: 1, step: .02, "mousemove-size": 400, "data-prop": "pan" } ),
		),
		GSUcreateDiv( { class: "gsuiDrumrow-gain", title: "gain" },
			GSUcreateElement( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 400, "data-prop": "gain" } ),
		),
	),
	GSUcreateElement( "form", { class: "gsuiDrumrow-props" },
		GSUcreateLabel( { class: "gsuiDrumrow-prop gsuiDrumrow-propDetune", tabindex: 0 },
			GSUcreateInput( { class: "gsuiDrumrow-propRadio", type: "radio", name: "prop", value: "detune" }, "pitch" ),
			GSUcreateSpan( { class: "gsuiDrumrow-propSpan" }, "pitch" ),
		),
		GSUcreateLabel( { class: "gsuiDrumrow-prop gsuiDrumrow-propPan", tabindex: 0 },
			GSUcreateInput( { class: "gsuiDrumrow-propRadio", type: "radio", name: "prop", value: "pan" }, "pan" ),
			GSUcreateSpan( { class: "gsuiDrumrow-propSpan" }, "pan" ),
		),
		GSUcreateLabel( { class: "gsuiDrumrow-prop gsuiDrumrow-propGain", tabindex: 0 },
			GSUcreateInput( { class: "gsuiDrumrow-propRadio", type: "radio", name: "prop", value: "gain" }, "gain" ),
			GSUcreateSpan( { class: "gsuiDrumrow-propSpan" }, "gain" ),
		),
	),
	GSUcreateDiv( { class: "gsuiDrumrows-drop" },
			GSUcreateDiv( { class: "gsuiDrumrows-dropIn" },
				GSUcreateI( { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
				GSUcreateI( { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
				GSUcreateI( { class: "gsuiIcon", "data-icon": "arrow-dropdown" } ),
			),
		),
] );
