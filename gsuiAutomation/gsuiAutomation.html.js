"use strict";

$.$setTemplate( "gsui-automation", () => {
	const popId = GSUuuid();

	return [
		$.$div( { class: "gsuiAutomation-in" },
			$.$div( { class: "gsuiAutomation-head" },
				$.$icon( { icon: "target" } ),
				$.$button( { class: "gsuiAutomation-btnTarget gsui-ellipsis", popovertarget: popId, "data-tooltip": GSTX.$automation_selectTarget } ),
				$.$elem( "gsui-duration", { max: 64 } ),
			),
			$.$div( { class: "gsuiAutomation-body" },
				$.$elem( "gsui-beatlines", { color: "#fff" } ),
				$.$elem( "gsui-dotline", { viewbox: "0 0 1 1", xstep: .001, ystep: .001 } ),
			),
			$.$div( { class: "gsuiAutomation-targetList", id: popId, popover: true } ),
		),
	];
} );
