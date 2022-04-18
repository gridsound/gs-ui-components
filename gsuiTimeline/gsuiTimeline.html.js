"use strict";

GSUI.setTemplate( "gsui-timeline", () => [
	GSUI.createElem( "div", { class: "gsuiTimeline-steps" } ),
	GSUI.createElem( "div", { class: "gsuiTimeline-beats" } ),
	GSUI.createElem( "div", { class: "gsuiTimeline-measures" } ),
	GSUI.createElem( "div", { class: "gsuiTimeline-loopLine" },
		GSUI.createElem( "div", { class: "gsuiTimeline-loop" },
			GSUI.createElem( "div", { class: "gsuiTimeline-loopBody" } ),
			GSUI.createElem( "div", { class: "gsuiTimeline-loopHandle gsuiTimeline-loopHandleA" } ),
			GSUI.createElem( "div", { class: "gsuiTimeline-loopBorder gsuiTimeline-loopBorderA" } ),
			GSUI.createElem( "div", { class: "gsuiTimeline-loopHandle gsuiTimeline-loopHandleB" } ),
			GSUI.createElem( "div", { class: "gsuiTimeline-loopBorder gsuiTimeline-loopBorderB" } ),
		),
	),
	GSUI.createElem( "div", { class: "gsuiTimeline-timeLine" },
		GSUI.createElemSVG( "svg", { class: "gsuiTimeline-cursor", width: "16", height: "10" },
			GSUI.createElemSVG( "polygon", { points: "2,2 8,8 14,2" } ),
		),
		GSUI.createElemSVG( "svg", { class: "gsuiTimeline-cursorPreview", width: "16", height: "10" },
			GSUI.createElemSVG( "polygon", { points: "2,2 8,8 14,2" } ),
		),
	),
] );
