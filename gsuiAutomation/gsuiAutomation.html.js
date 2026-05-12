"use strict";

let gsuiAutomation_count = 0;

$.$setTemplate( "gsui-automation", () => {
	const popId = `gsuiAutomation_count_${ ++gsuiAutomation_count }`;

	return [
		$.$div( { class: "gsuiAutomation-in" },
			$.$div( { class: "gsuiAutomation-head" },
				$.$icon( { icon: "target" } ),
				$.$button( { class: "gsuiAutomation-btnTarget gsui-ellipsis", popovertarget: popId, title: "Select automation's target" } ),
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
