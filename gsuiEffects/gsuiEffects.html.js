"use strict";

$.$setTemplate( "gsui-effects", () => {
	const popId = GSUuuid();

	return [
		$.$button( { popovertarget: popId, "data-tooltip": GSTX.$effects_add },
			$.$icon( { icon: "add-effect" } ),
		),
		$.$elem( "gsui-dropdown", { id: popId },
			$.$elem( "gsui-dropdown-option", { value: "filter",     name: GSTX.$effects_filter,     desc: GSTX.$effects_filter_desc } ),
			$.$elem( "gsui-dropdown-option", { value: "delay",      name: GSTX.$effects_delay,      desc: GSTX.$effects_delay_desc } ),
			$.$elem( "gsui-dropdown-option", { value: "reverb",     name: GSTX.$effects_reverb,     desc: GSTX.$effects_reverb_desc } ),
			$.$elem( "gsui-dropdown-option", { value: "waveshaper", name: GSTX.$effects_waveshaper, desc: GSTX.$effects_waveshaper_desc } ),
		),
	];
} );
