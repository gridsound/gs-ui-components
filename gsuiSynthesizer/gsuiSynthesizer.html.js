"use strict";

$.$setTemplate( "gsui-synthesizer", () => [
	$.$div( { class: "gsuiSynthesizer-shadowTop" } ),
	$.$div( { class: "gsuiSynthesizer-scrollArea" },
		// .....................................................................
		// $.$div( { class: "gsuiSynthesizer-preset" },
		//    $.$getTemplate( "gsui-synthesizer-headTitle", { name: "preset", help: "synth-presets" } ),
		//    $.$button( { "data-action": "-1", icon: "caret-left", "data-tooltip": "Use <b>previous</b> preset" } ),
		//    $.$button( { "data-action": "+1", icon: "caret-right", "data-tooltip": "Use <b>next</b> preset" } ),
		//    $.$span( { inert: true } ),
		// ),
		// .....................................................................
		$.$div( { class: "gsuiSynthesizer-head" },
			$.$getTemplate( "gsui-synthesizer-headTitle", { name: "envelopes", help: "synth-envelopes" } ),
			$.$getTemplate( "gsui-synthesizer-headTab", { id: "env gain", name: "gain" } ),
			$.$getTemplate( "gsui-synthesizer-headTab", { id: "env detune", name: "pitch" } ),
			$.$getTemplate( "gsui-synthesizer-headTab", { id: "env lowpass", name: "lowpass" } ),
			$.$getTemplate( "gsui-synthesizer-headTab", { id: "env wtpos", name: "wtpos" } ),
		),
		$.$elem( "gsui-envelope" ),
		// .....................................................................
		$.$div( { class: "gsuiSynthesizer-head" },
			$.$getTemplate( "gsui-synthesizer-headTitle", { name: "LFOs", help: "synth-LFOs" } ),
			$.$getTemplate( "gsui-synthesizer-headTab", { id: "lfo gain", name: "gain" } ),
			$.$getTemplate( "gsui-synthesizer-headTab", { id: "lfo pan", name: "pan" } ),
			$.$getTemplate( "gsui-synthesizer-headTab", { id: "lfo detune", name: "pitch" } ),
			$.$getTemplate( "gsui-synthesizer-headTab", { id: "lfo lowpass", name: "lowpass" } ),
			$.$getTemplate( "gsui-synthesizer-headTab", { id: "lfo wtpos", name: "wtpos" } ),
		),
		$.$elem( "gsui-lfo" ),
		// .....................................................................
		$.$div( { class: "gsuiSynthesizer-head gsuiSynthesizer-headNoise" },
			$.$getTemplate( "gsui-synthesizer-headTitle", { name: "noise", help: "synth-noise" } ),
			$.$elem( "gsui-toggle", { off: true } ),
		),
		$.$elem( "gsui-noise" ),
		// .....................................................................
		$.$div( { class: "gsuiSynthesizer-head gsuiSynthesizer-headOscs" },
			$.$getTemplate( "gsui-synthesizer-headTitle", { name: "oscillators", help: "synth-oscillator" } ),
		),
		$.$div( { class: "gsuiSynthesizer-oscList" },
			$.$button( { class: "gsuiSynthesizer-newOsc" },
				$.$icon( { icon: "plus" } ),
			),
		),
	),
	$.$div( { class: "gsuiSynthesizer-shadowBottom" } ),
] );

$.$setTemplate( "gsui-synthesizer-headTitle", p =>
	$.$span( { class: "gsuiSynthesizer-headTitle" },
		$.$span( { class: "gsuiSynthesizer-headExpand" }, p.name ),
		$.$elem( "gsui-help-link", { page: p.help } ),
	)
);

$.$setTemplate( "gsui-synthesizer-headTab", p =>
	$.$div( { class: "gsuiSynthesizer-headTab", "data-tab": p.id },
		$.$elem( "gsui-toggle", { off: true } ),
		$.$span( { inert: true }, p.name ),
	)
);
