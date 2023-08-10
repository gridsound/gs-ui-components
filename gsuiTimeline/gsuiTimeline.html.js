"use strict";

GSUsetTemplate( "gsui-timeline", () => [
	GSUcreateElement( "div", { class: "gsuiTimeline-steps" } ),
	GSUcreateElement( "div", { class: "gsuiTimeline-beats" } ),
	GSUcreateElement( "div", { class: "gsuiTimeline-measures" } ),
	GSUcreateElement( "div", { class: "gsuiTimeline-loopLine" },
		GSUcreateElement( "div", { class: "gsuiTimeline-loop" },
			GSUcreateElement( "div", { class: "gsuiTimeline-loopBody" } ),
			GSUcreateElement( "div", { class: "gsuiTimeline-loopHandle gsuiTimeline-loopHandleA" } ),
			GSUcreateElement( "div", { class: "gsuiTimeline-loopBorder gsuiTimeline-loopBorderA" } ),
			GSUcreateElement( "div", { class: "gsuiTimeline-loopHandle gsuiTimeline-loopHandleB" } ),
			GSUcreateElement( "div", { class: "gsuiTimeline-loopBorder gsuiTimeline-loopBorderB" } ),
		),
	),
	GSUcreateElement( "div", { class: "gsuiTimeline-timeLine" },
		GSUcreateElementSVG( "svg", { class: "gsuiTimeline-cursor", width: "16", height: "10" },
			GSUcreateElementSVG( "polygon", { points: "2,2 8,8 14,2" } ),
		),
		GSUcreateElementSVG( "svg", { class: "gsuiTimeline-cursorPreview", width: "16", height: "10" },
			GSUcreateElementSVG( "polygon", { points: "2,2 8,8 14,2" } ),
		),
	),
] );
