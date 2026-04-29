"use strict";

GSUsetTemplate( "gsui-mixer", () =>
	$.$elem( "gsui-panels", { dir: "x" },
		$.$div( { class: "gsuiMixer-channels" },
			$.$div( { class: "gsuiMixer-head" },
				$.$icon( { class: "gsuiMixer-head-icon", icon: "channels" } ),
				$.$span( { class: "gsuiMixer-head-title", inert: true }, "channels" ),
				$.$elem( "gsui-help-link", { page: "mixer-channels" } ),
				$.$div( { class: "gsuiMixer-analyserTypes" },
					$.$icon( { icon: "cu-waveform" } ),
					$.$button( null,
						GSUgetTemplate( "gsui-mixer-analyser-label", "timeDomain" ),
						GSUgetTemplate( "gsui-mixer-analyser-label", "frequency" ),
					),
				),
			),
			$.$elem( "gsui-channels" ),
		),
		$.$div( { class: "gsuiMixer-effects" },
			$.$div( { class: "gsuiMixer-head" },
				$.$icon( { class: "gsuiMixer-head-icon", icon: "effects" } ),
				$.$span( { class: "gsuiMixer-head-title", inert: true }, "effects" ),
				$.$elem( "gsui-help-link", { page: "mixer-effects" } ),
			),
			$.$elem( "gsui-effects" ),
			$.$div( { class: "gsuiMixer-bottomShadow", inert: true } ),
		),
	),
);

GSUsetTemplate( "gsui-mixer-analyser-label", txt =>
	$.$div( { inert: true },
		$.$icon( { icon: "radio-btn-checked" } ),
		$.$span( null, txt ),
	)
);
