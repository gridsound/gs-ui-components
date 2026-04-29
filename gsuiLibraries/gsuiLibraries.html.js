"use strict";

$.$setTemplate( "gsui-libraries", () => [
	$.$div( { class: "gsuiLibraries-head" },
		$.$icon( { class: "gsuiLibraries-head-icon", icon: "cu-waveform" } ),
		$.$span( { class: "gsuiLibraries-head-title" }, "library" ),
		$.$div( { class: "gsuiLibraries-libBtns" },
			$.$button( { class: "gsuiLibraries-libBtn", "data-lib": "default" }, "default" ),
			$.$button( { class: "gsuiLibraries-libBtn", "data-lib": "local" }, "local" ),
		),
	),
	$.$div( { class: "gsuiLibraries-body" },
		$.$elem( "gsui-library", { class: "gsuiLibrary-default" } ),
		$.$elem( "gsui-library", { class: "gsuiLibrary-local" } ),
	),
] );
