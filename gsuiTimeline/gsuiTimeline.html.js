"use strict";

GSUsetTemplate( "gsui-timeline", () => [
	GSUcreateDiv( { class: "gsuiTimeline-steps" } ),
	GSUcreateDiv( { class: "gsuiTimeline-beats" } ),
	GSUcreateDiv( { class: "gsuiTimeline-measures" } ),
	GSUcreateDiv( { class: "gsuiTimeline-loop" },
		GSUcreateDiv( { class: "gsuiTimeline-loopBody" } ),
		GSUcreateDiv( { class: "gsuiTimeline-loopHandle gsuiTimeline-loopHandleA" } ),
		GSUcreateDiv( { class: "gsuiTimeline-loopBorder gsuiTimeline-loopBorderA" } ),
		GSUcreateDiv( { class: "gsuiTimeline-loopHandle gsuiTimeline-loopHandleB" } ),
		GSUcreateDiv( { class: "gsuiTimeline-loopBorder gsuiTimeline-loopBorderB" } ),
	),
	GSUcreateElement( "svg", { class: "gsuiTimeline-cursor", width: "16", height: "10" },
		GSUcreateElement( "polygon", { points: "2,2 8,8 14,2" } ),
	),
	GSUcreateElement( "svg", { class: "gsuiTimeline-cursorPreview", width: "16", height: "10" },
		GSUcreateElement( "polygon", { points: "2,2 8,8 14,2" } ),
	),
] );
