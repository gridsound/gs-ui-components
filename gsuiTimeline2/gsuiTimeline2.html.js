"use strict";

GSUI.setTemplate( "gsui-timeline2", () => [
	GSUI.createElement( "div", { class: "gsuiTimeline2-steps" } ),
	GSUI.createElement( "div", { class: "gsuiTimeline2-beats" } ),
	GSUI.createElement( "div", { class: "gsuiTimeline2-loopLine" },
		GSUI.createElement( "div", { class: "gsuiTimeline2-loop" },
			GSUI.createElement( "div", { class: "gsuiTimeline2-loopBody" } ),
			GSUI.createElement( "div", { class: "gsuiTimeline2-loopHandle gsuiTimeline2-loopHandleA" } ),
			GSUI.createElement( "div", { class: "gsuiTimeline2-loopBorder gsuiTimeline2-loopBorderA" } ),
			GSUI.createElement( "div", { class: "gsuiTimeline2-loopHandle gsuiTimeline2-loopHandleB" } ),
			GSUI.createElement( "div", { class: "gsuiTimeline2-loopBorder gsuiTimeline2-loopBorderB" } ),
		),
	),
	GSUI.createElement( "div", { class: "gsuiTimeline2-timeLine" },
		GSUI.createElementNS( "svg", { class: "gsuiTimeline2-cursor", width: "16", height: "10" },
			GSUI.createElementNS( "polygon", { points: "2,2 8,8 14,2" } ),
		),
		GSUI.createElementNS( "svg", { class: "gsuiTimeline2-cursorPreview", width: "16", height: "10" },
			GSUI.createElementNS( "polygon", { points: "2,2 8,8 14,2" } ),
		),
	),
] );
