"use strict";

$.$setTemplate( "gsui-automation", () => {
	const popId = GSUuuid();

	return [
		$.$elem( "gsui-automation-in", null,
			$.$elem( "gsui-automation-head", null,
				$.$icon( { icon: "target" } ),
				$.$button( { class: "gsui-ellipsis", popovertarget: popId, "data-tooltip": GSTX.$automation_selectTarget } ),
				$.$elem( "gsui-duration", { max: 64 } ),
			),
			$.$elem( "gsui-automation-body", null,
				$.$elem( "gsui-beatlines", { color: "#fff" } ),
				$.$elem( "gsui-dotline", { viewbox: "0 0 1 1", xstep: .001, ystep: .001 } ),
			),
			$.$elem( "gsui-automation-targets", { id: popId, popover: true } ),
		),
	];
} );
