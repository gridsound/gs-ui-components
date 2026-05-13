"use strict";

let gsuiOscillator_count = 0;

$.$setTemplate( "gsui-oscillator", () => {
	const popId = `gsuiOscillator_count_${ ++gsuiOscillator_count }`;

	return $.$div( { class: "gsuiOscillator-in" },
		$.$div( { class: "gsuiOscillator-grip gsuiIcon", "data-icon": "grip-v" } ),
		$.$div( { class: "gsuiOscillator-id", inert: true } ),
		$.$span( { class: "gsuiOscillator-head-label" }, "unison" ),
		$.$span( { class: "gsuiOscillator-head-label" }, "pitch" ),
		$.$span( { class: "gsuiOscillator-head-label" }, "pan" ),
		$.$span( { class: "gsuiOscillator-head-label" }, "gain" ),
		$.$div( { class: "gsuiOscillator-waveletBrowser-pop", id: popId, popover: true } ),
		$.$div( { class: "gsuiOscillator-waveColumn" },
			$.$div( { class: "gsuiOscillator-waveWrap" },
				$.$div( { class: "gsuiOscillator-waveWrap-left" },
					$.$div( { class: "gsuiOscillator-waveWrap-top" },
						$.$button( { "data-dir": "-1", icon: "caret-left", title: "Previous wave" } ),
						$.$button( { "data-dir": "1", icon: "caret-right", title: "Next wave" } ),
						$.$button( { class: "gsuiOscillator-waveName", popovertarget: popId } ),
						$.$button( { class: "gsuiOscillator-waveEdit", icon: "cu-wave-edit", title: "Open wavetable editor" } ),
						$.$icon( { class: "gsuiOscillator-sourceIcon", icon: "cu-waveform" } ),
						$.$span( { class: "gsuiOscillator-sourceName" } ),
					),
					$.$div( { class: "gsuiOscillator-waveWrap-bottom", inert: true },
						$.$div( { class: "gsuiOscillator-source" } ),
						$.$div( { class: "gsuiOscillator-wave" },
							$.$elem( "gsui-periodicwave" ),
							$.$elem( "gsui-periodicwave" ),
						),
					),
				),
			),
			$.$elem( "gsui-slider", { type: "linear-x", min: 0, max: 1, step: .001, "mousemove-size": "400", "data-prop": "phaze", defaultValue: 0 } ),
		),
		$.$div( { class: "gsuiOscillator-unison" },
			$.$div( { class: "gsuiOscillator-unisonGraph" },
				$.$div( { class: "gsuiOscillator-unisonGraph-voices" } ),
			),
			$.$elem( "gsui-slider", { type: "linear-y", min: 1, max: 9, step: 1, "mousemove-size": "400", "data-prop": "unisonvoices", defaultValue: 1 } ),
			$.$elem( "gsui-slider", { type: "linear-y", min: 0, max: 2, step: .01, "mousemove-size": "800", "data-prop": "unisondetune" } ),
			$.$elem( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .001, "mousemove-size": "800", "data-prop": "unisonblend" } ),
		),
		[
			[ "detune", "pitch", -24, 24, 1, 0 ],
			[ "pan", "pan", -1, 1, .02, 0 ],
			[ "gain", "gain", 0, 1, .01, 1 ],
		].map( ( [ prop, title, min, max, step, def ] ) =>
			$.$div( { class: "gsuiOscillator-prop", "data-prop": prop, title },
				$.$div( { class: "gsuiOscillator-sliderWrap" },
					$.$elem( "gsui-slider", { type: "circular", min, max, step, "mousemove-size": "800", "data-prop": prop, defaultValue: def } ),
					prop !== "detune" ? null : $.$elem( "gsui-slider", { type: "circular", min: -1, max: 1, step: .01, "mousemove-size": "800", "data-prop": "detunefine", "stroke-width": 3, defaultValue: 0 } )
				),
				$.$div( { class: "gsuiOscillator-sliderValue" } ),
			)
		),
		$.$button( { class: "gsuiOscillator-remove", icon: "close", title: "Remove the oscillator" } ),
		$.$div( { class: "gsuiOscillator-wavetable" } ),
	);
} );
