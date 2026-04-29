"use strict";

$.$setTemplate( "gsui-timeline", () => [
	$.$div( { class: "gsuiTimeline-steps" } ),
	$.$div( { class: "gsuiTimeline-beats" } ),
	$.$div( { class: "gsuiTimeline-measures" } ),
	$.$div( { class: "gsuiTimeline-loop" },
		$.$div( { class: "gsuiTimeline-loopBody" } ),
		$.$div( { class: "gsuiTimeline-loopHandle gsuiTimeline-loopHandleA" } ),
		$.$div( { class: "gsuiTimeline-loopBorder gsuiTimeline-loopBorderA" } ),
		$.$div( { class: "gsuiTimeline-loopHandle gsuiTimeline-loopHandleB" } ),
		$.$div( { class: "gsuiTimeline-loopBorder gsuiTimeline-loopBorderB" } ),
	),
	$.$elem( "svg", { class: "gsuiTimeline-cursor", width: "16", height: "10" },
		$.$elem( "polygon", { points: "2,2 8,8 14,2" } ),
	),
	$.$elem( "svg", { class: "gsuiTimeline-cursorPreview", width: "16", height: "10" },
		$.$elem( "polygon", { points: "2,2 8,8 14,2" } ),
	),
] );
