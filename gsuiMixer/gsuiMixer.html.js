"use strict";

$.$setTemplate( "gsui-mixer", () =>
	$.$elem( "gsui-panels", { dir: "x" },
		$.$elem( "gsui-mixer-channels", null,
			$.$elem( "gsui-mixer-head", null,
				$.$icon( { icon: "channels" } ),
				$.$bold( { inert: true }, GSTX.$mixer_channels ),
				$.$elem( "gsui-help-link", { page: "mixer-channels" } ),
				$.$elem( "gsui-mixer-analyser-types", null,
					$.$icon( { icon: "cu-waveform" } ),
					$.$button( { "data-tooltip": GSTX.$mixer_visu },
						$.$getTemplate( "gsui-mixer-analyser-label", GSTX.$mixer_timeDomain ),
						$.$getTemplate( "gsui-mixer-analyser-label", GSTX.$mixer_frequency ),
					),
				),
			),
			$.$elem( "gsui-channels" ),
		),
		$.$elem( "gsui-mixer-effects", null,
			$.$elem( "gsui-mixer-head", null,
				$.$icon( { icon: "effects" } ),
				$.$bold( { inert: true }, GSTX.$mixer_effects ),
				$.$elem( "gsui-help-link", { page: "mixer-effects" } ),
			),
			$.$elem( "gsui-effects" ),
			$.$elem( "gsui-mixer-bottom-shadow", { inert: true } ),
		),
	),
);

$.$setTemplate( "gsui-mixer-analyser-label", txt =>
	$.$div( { inert: true },
		$.$icon( { icon: "radio-btn-checked" } ),
		$.$span( null, txt ),
	)
);
