"use strict";

$.$setTemplate( "gsui-popup", () => [
	$.$elem( "dialog", { class: "gsuiPopup-window" },
		$.$div( { class: "gsuiPopup-head" } ),
		$.$elem( "form", { class: "gsuiPopup-body" },
			$.$div( { class: "gsuiPopup-content" } ),
			$.$div( { class: "gsuiPopup-message" } ),
			$.$input( { class: "gsuiPopup-inputText", type: "text" } ),
			$.$flex( { x: true, xcenter: true, g10: true },
				$.$elem( "gsui-com-button", { class: "gsuiPopup-cancel", text: "Cancel" } ),
				$.$elem( "gsui-com-button", { class: "gsuiPopup-ok", text: "Ok", type: "submit" } ),
			),
		),
	),
] );
