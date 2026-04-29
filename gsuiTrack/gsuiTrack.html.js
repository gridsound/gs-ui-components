"use strict";

$.$setTemplate( "gsui-track", () => [
	$.$elem( "gsui-toggle", { title: "toggle track (right click for solo)" } ),
	$.$div( { class: "gsuiTrack-nameWrap" },
		$.$input( { class: "gsuiTrack-name", type: "text", disabled: true, spellcheck: "false" } ),
	),
] );

$.$setTemplate( "gsui-track-row", () =>
	$.$div( { class: "gsuiTrack-row gsui-row" },
		$.$div(),
	)
);
