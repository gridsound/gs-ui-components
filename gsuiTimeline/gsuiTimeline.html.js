"use strict";

GSUI.$setTemplate( "gsui-timeline", () => [
	GSUI.$createElement( "div", { class: "gsuiTimeline-steps" } ),
	GSUI.$createElement( "div", { class: "gsuiTimeline-beats" } ),
	GSUI.$createElement( "div", { class: "gsuiTimeline-measures" } ),
	GSUI.$createElement( "div", { class: "gsuiTimeline-loopLine" },
		GSUI.$createElement( "div", { class: "gsuiTimeline-loop" },
			GSUI.$createElement( "div", { class: "gsuiTimeline-loopBody" } ),
			GSUI.$createElement( "div", { class: "gsuiTimeline-loopHandle gsuiTimeline-loopHandleA" } ),
			GSUI.$createElement( "div", { class: "gsuiTimeline-loopBorder gsuiTimeline-loopBorderA" } ),
			GSUI.$createElement( "div", { class: "gsuiTimeline-loopHandle gsuiTimeline-loopHandleB" } ),
			GSUI.$createElement( "div", { class: "gsuiTimeline-loopBorder gsuiTimeline-loopBorderB" } ),
		),
	),
	GSUI.$createElement( "div", { class: "gsuiTimeline-timeLine" },
		GSUI.$createElementSVG( "svg", { class: "gsuiTimeline-cursor", width: "16", height: "10" },
			GSUI.$createElementSVG( "polygon", { points: "2,2 8,8 14,2" } ),
		),
		GSUI.$createElementSVG( "svg", { class: "gsuiTimeline-cursorPreview", width: "16", height: "10" },
			GSUI.$createElementSVG( "polygon", { points: "2,2 8,8 14,2" } ),
		),
	),
] );
