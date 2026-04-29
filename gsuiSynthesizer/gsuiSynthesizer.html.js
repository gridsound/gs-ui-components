"use strict";

GSUsetTemplate( "gsui-synthesizer", () => [
	$.$div( { class: "gsuiSynthesizer-shadowTop" } ),
	$.$div( { class: "gsuiSynthesizer-scrollArea" },
		// .....................................................................
		// $.$div( { class: "gsuiSynthesizer-preset" },
		//    GSUgetTemplate( "gsui-synthesizer-headTitle", { name: "preset", help: "synth-presets" } ),
		//    $.$button( { "data-action": "-1", icon: "caret-left", title: "Use previous preset" } ),
		//    $.$button( { "data-action": "+1", icon: "caret-right", title: "Use next preset" } ),
		//    $.$span( { inert: true } ),
		// ),
		// .....................................................................
		$.$div( { class: "gsuiSynthesizer-head" },
			GSUgetTemplate( "gsui-synthesizer-headTitle", { name: "envelopes", help: "synth-envelopes" } ),
			GSUgetTemplate( "gsui-synthesizer-headTab", { id: "env gain", name: "gain" } ),
			GSUgetTemplate( "gsui-synthesizer-headTab", { id: "env detune", name: "pitch" } ),
			GSUgetTemplate( "gsui-synthesizer-headTab", { id: "env lowpass", name: "lowpass" } ),
		),
		$.$elem( "gsui-envelope" ),
		// .....................................................................
		$.$div( { class: "gsuiSynthesizer-head" },
			GSUgetTemplate( "gsui-synthesizer-headTitle", { name: "LFOs", help: "synth-LFOs" } ),
			GSUgetTemplate( "gsui-synthesizer-headTab", { id: "lfo gain", name: "gain" } ),
			GSUgetTemplate( "gsui-synthesizer-headTab", { id: "lfo detune", name: "pitch" } ),
		),
		$.$elem( "gsui-lfo" ),
		// .....................................................................
		$.$div( { class: "gsuiSynthesizer-head gsuiSynthesizer-headNoise" },
			GSUgetTemplate( "gsui-synthesizer-headTitle", { name: "noise", help: "synth-noise" } ),
			$.$elem( "gsui-toggle", { off: true } ),
		),
		$.$elem( "gsui-noise" ),
		// .....................................................................
		$.$div( { class: "gsuiSynthesizer-head gsuiSynthesizer-headOscs" },
			GSUgetTemplate( "gsui-synthesizer-headTitle", { name: "oscillators", help: "synth-oscillator" } ),
		),
		$.$div( { class: "gsuiSynthesizer-oscList" },
			$.$button( { class: "gsuiSynthesizer-newOsc" },
				$.$icon( { icon: "plus" } ),
			),
		),
	),
	$.$div( { class: "gsuiSynthesizer-shadowBottom" } ),
] );

GSUsetTemplate( "gsui-synthesizer-headTitle", p =>
	$.$span( { class: "gsuiSynthesizer-headTitle" },
		$.$span( { class: "gsuiSynthesizer-headExpand" }, p.name ),
		$.$elem( "gsui-help-link", { page: p.help } ),
	)
);

GSUsetTemplate( "gsui-synthesizer-headTab", p =>
	$.$div( { class: "gsuiSynthesizer-headTab", "data-tab": p.id },
		$.$elem( "gsui-toggle", { off: true } ),
		$.$span( { inert: true }, p.name ),
	)
);
