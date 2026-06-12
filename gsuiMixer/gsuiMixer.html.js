"use strict";

$.$setTemplate( "gsui-mixer", () =>
	$.$elem( "gsui-panels", { dir: "x" },
		$.$div( { class: "gsuiMixer-channels" },
			$.$div( { class: "gsuiMixer-head" },
				$.$icon( { class: "gsuiMixer-head-icon", icon: "channels" } ),
				$.$bold( { inert: true }, GSTX.$mixer_channels ),
				$.$elem( "gsui-help-link", { page: "mixer-channels" } ),
				$.$div( { class: "gsuiMixer-analyserTypes" },
					$.$icon( { icon: "cu-waveform" } ),
					$.$button( { "data-tooltip": GSTX.$mixer_visu },
						$.$getTemplate( "gsui-mixer-analyser-label", GSTX.$mixer_timeDomain ),
						$.$getTemplate( "gsui-mixer-analyser-label", GSTX.$mixer_frequency ),
					),
				),
			),
			$.$elem( "gsui-channels" ),
		),
		$.$div( { class: "gsuiMixer-effects" },
			$.$div( { class: "gsuiMixer-head" },
				$.$icon( { class: "gsuiMixer-head-icon", icon: "effects" } ),
				$.$bold( { inert: true }, GSTX.$mixer_effects ),
				$.$elem( "gsui-help-link", { page: "mixer-effects" } ),
			),
			$.$elem( "gsui-effects" ),
			$.$div( { class: "gsuiMixer-bottomShadow", inert: true } ),
		),
	),
);

$.$setTemplate( "gsui-mixer-analyser-label", txt =>
	$.$div( { inert: true },
		$.$icon( { icon: "radio-btn-checked" } ),
		$.$span( null, txt ),
	)
);
