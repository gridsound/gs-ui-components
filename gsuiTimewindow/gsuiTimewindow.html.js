"use strict";

GSUsetTemplate( "gsui-timewindow", () => [
	GSUcreateDiv( { class: "gsuiTimewindow-scrollArea" },
		GSUcreateDiv( { class: "gsuiTimewindow-panel" },
			GSUcreateDiv( { class: "gsuiTimewindow-panelUp" },
				GSUcreateButton( { class: "gsuiTimewindow-step" },
					GSUcreateSpan( { class: "gsuiTimewindow-stepValue" } ),
					GSUcreateI( { class: "gsuiIcon", "data-icon": "magnet" } ),
				),
				GSUcreateElement( "gsui-slider", { "data-zoom": "y", type: "linear-y", "mousemove-size": 400, min: 0, max: 1, step: .01, title: "zooming Y" } ),
				GSUcreateElement( "gsui-slider", { "data-zoom": "x", type: "linear-y", "mousemove-size": 400, min: 0, max: 1, step: .01, title: "zooming X" } ),
			),
			GSUcreateDiv( { class: "gsuiTimewindow-panelContent" } ),
			GSUcreateDiv( { class: "gsuiTimewindow-panelContentDown" },
				GSUcreateDiv( { class: "gsuiTimewindow-panelExtend gsuiTimewindow-panelExtendX" } ),
			),
			GSUcreateDiv( { class: "gsuiTimewindow-panelExtend gsuiTimewindow-panelExtendY" } ),
		),
		GSUcreateDiv( { class: "gsuiTimewindow-main" },
			GSUcreateDiv( { class: "gsuiTimewindow-time" },
				GSUcreateElement( "gsui-timeline" ),
			),
			GSUcreateDiv( { class: "gsuiTimewindow-mainBody" },
				GSUcreateDiv( { class: "gsuiTimewindow-mainContent" },
					GSUcreateElement( "gsui-beatlines", { coloredbeats: "" } ),
					GSUcreateDiv( { class: "gsuiTimewindow-currentTime" } ),
					GSUcreateDiv( { class: "gsuiTimewindow-loop gsuiTimewindow-loopA" } ),
					GSUcreateDiv( { class: "gsuiTimewindow-loop gsuiTimewindow-loopB" } ),
					GSUcreateDiv( { class: "gsuiTimewindow-rows" } ),
				),
			),
			GSUcreateDiv( { class: "gsuiTimewindow-contentDown" },
				GSUcreateDiv( { class: "gsuiTimewindow-panelExtend gsuiTimewindow-panelExtendX" } ),
			),
		),
	),
	GSUcreateDiv( { class: "gsuiTimewindow-minimap" },
		GSUcreateDiv( { class: "gsuiTimewindow-minimapPanel" } ),
		GSUcreateDiv( { class: "gsuiTimewindow-minimapTrack", "data-action": "track" },
			GSUcreateDiv( { class: "gsuiTimewindow-minimapLoop", inert: true } ),
			GSUcreateDiv( { class: "gsuiTimewindow-minimapCurrentTime", inert: true } ),
			GSUcreateDiv( { class: "gsuiTimewindow-minimapThumb", "data-action": "thumb" },
				GSUcreateDiv( { class: "gsuiTimewindow-minimapThumb-crop", "data-action": "cropA" } ),
				GSUcreateDiv( { class: "gsuiTimewindow-minimapThumb-crop", "data-action": "cropB" } ),
			),
		),
	),
] );

