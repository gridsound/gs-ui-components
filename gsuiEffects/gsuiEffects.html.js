"use strict";

$.$setTemplate( "gsui-effects", () => {
	const popId = GSUuuid();

	return [
		$.$button( { popovertarget: popId, "data-tooltip": GSTX.$effects_add },
			$.$icon( { icon: "add-effect" } ),
		),
		$.$elem( "gsui-effects-poplist", { id: popId, popover: true },
			[
				[ "filter",     GSTX.$effects_filter,     GSTX.$effects_filter_desc     ],
				[ "delay",      GSTX.$effects_delay,      GSTX.$effects_delay_desc      ],
				[ "reverb",     GSTX.$effects_reverb,     GSTX.$effects_reverb_desc     ],
				[ "waveshaper", GSTX.$effects_waveshaper, GSTX.$effects_waveshaper_desc ],
			].map( fx => $.$button( { "data-prop": fx[ 0 ] },
				$.$bold( { inert: true }, fx[ 1 ] ),
				$.$span( { inert: true }, fx[ 2 ] ),
			) ),
		),
	];
} );
