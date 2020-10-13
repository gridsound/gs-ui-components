"use strict";

GSUI.setTemplate( "gsui-timewindow", () => [
	GSUI.createElement( "div", { class: "gsuiTimewindow-panel" },
		GSUI.createElement( "div", { class: "gsuiTimewindow-panelUp" },
			GSUI.createElement( "button", { class: "gsuiTimewindow-step" },
				GSUI.createElement( "span", { class: "gsuiTimewindow-stepValue" } ),
				GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "magnet" } ),
			),
		),
		GSUI.createElement( "div", { class: "gsuiTimewindow-panelContent" } ),
		GSUI.createElement( "div", { class: "gsuiTimewindow-panelContentDown" },
			GSUI.createElement( "div", { class: "gsuiTimewindow-panelExtend gsuiTimewindow-panelExtendX" } ),
		),
		GSUI.createElement( "div", { class: "gsuiTimewindow-panelExtend gsuiTimewindow-panelExtendY" } ),
	),
	GSUI.createElement( "div", { class: "gsuiTimewindow-main" },
		GSUI.createElement( "div", { class: "gsuiTimewindow-time" },
			GSUI.createElement( "gsui-timeline2" ),
		),
		GSUI.createElement( "div", { class: "gsuiTimewindow-mainBody" },
			GSUI.createElement( "div", { class: "gsuiTimewindow-mainContent" },
				GSUI.createElement( "gsui-beatlines", { coloredbeats: "" } ),
				GSUI.createElement( "div", { class: "gsuiTimewindow-currentTime" } ),
				GSUI.createElement( "div", { class: "gsuiTimewindow-loop gsuiTimewindow-loopA" } ),
				GSUI.createElement( "div", { class: "gsuiTimewindow-loop gsuiTimewindow-loopB" } ),
				GSUI.createElement( "div", { class: "gsuiTimewindow-rows" } ),
			),
		),
		GSUI.createElement( "div", { class: "gsuiTimewindow-contentDown" },
			GSUI.createElement( "div", { class: "gsuiTimewindow-panelExtend gsuiTimewindow-panelExtendX" } ),
		),
	),
] );
