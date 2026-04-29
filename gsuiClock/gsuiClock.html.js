"use strict";

GSUsetTemplate( "gsui-clock", () => [
	$.$div( { class: "gsuiClock-relative", inert: true },
		$.$div( { class: "gsuiClock-absolute" },
			$.$div( { class: "gsuiClock-a" }, "0" ),
			$.$div( { class: "gsuiClock-b" }, "00" ),
			$.$div( { class: "gsuiClock-c" }, "000" ),
			$.$span( { class: "gsuiClock-modeText" } ),
		),
	),
	$.$button( { class: "gsuiClock-modes" },
		$.$div( { class: "gsuiClock-mode gsuiClock-beat" } ),
		$.$div( { class: "gsuiClock-mode gsuiClock-second" } ),
	),
] );
