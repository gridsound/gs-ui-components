"use strict";

$.$setTemplate( "gsui-track", () => [
	$.$elem( "gsui-toggle", { 'data-tooltip': GSTX.$track_mute } ),
	$.$div( { class: "gsuiTrack-nameWrap", 'data-tooltip': GSTX.$track_rename },
		$.$input( { class: "gsuiTrack-name", type: "text", disabled: true, spellcheck: "false" } ),
	),
] );

$.$setTemplate( "gsui-track-row", () =>
	$.$div( { class: "gsuiTrack-row gsui-row" },
		$.$div(),
	)
);
