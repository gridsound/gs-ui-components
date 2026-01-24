"use strict";

GSUsetTemplate( "gsui-drumrow", () => [
	GSUcreateDiv( { class: "gsuiDrumrow-grip" },
		GSUcreateIcon( { icon: "grip-v" } ),
	),
	GSUcreateDiv( { class: "gsuiDrumrow-main" },
		GSUcreateElement( "gsui-toggle", { title: "Toggle the drumrow (right click for solo)" } ),
		GSUcreateButton( { class: "gsuiDrumrow-btnProps",  "data-action": "props",  icon: "drumprops", title: "Expand props panel" } ),
		GSUcreateButton( { class: "gsuiDrumrow-btnDelete", "data-action": "delete", icon: "close",     title: "Remove the drumrow" } ),
		GSUcreateSpan( { class: "gsuiDrumrow-name" } ),
		GSUcreateDiv( { class: "gsuiDrumrow-waveWrap" } ),
		GSUcreateElement( "gsui-slider", { type: "linear-y", min: -12, max: 12, step: 1, "mousemove-size": 400, "data-prop": "detune", defaultValue: 0 } ),
		GSUcreateElement( "gsui-slider", { type: "linear-y", min: -1, max: 1, step: .02, "mousemove-size": 400, "data-prop": "pan", defaultValue: 0 } ),
		GSUcreateElement( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 400, "data-prop": "gain", defaultValue: 1 } ),
	),
	GSUcreateElement( "gsui-prop-select", { props: "gain pan detune:pitch" } ),
] );
