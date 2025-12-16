"use strict";

GSUsetTemplate( "gsui-synthesizer", () => [
	GSUcreateDiv( { class: "gsuiSynthesizer-shadowTop" } ),
	GSUcreateDiv( { class: "gsuiSynthesizer-scrollArea" },
		// .....................................................................
		GSUcreateDiv( { class: "gsuiSynthesizer-preset" },
			GSUgetTemplate( "gsui-synthesizer-headTitle", { name: "preset", help: "synth-presets" } ),
			GSUcreateButton( { "data-action": "-1", icon: "caret-left", title: "Use previous preset" } ),
			GSUcreateButton( { "data-action": "+1", icon: "caret-right", title: "Use next preset" } ),
			GSUcreateSpan( { inert: true } ),
		),
		// .....................................................................
		GSUcreateDiv( { class: "gsuiSynthesizer-head" },
			GSUgetTemplate( "gsui-synthesizer-headTitle", { name: "envelopes", help: "synth-envelopes" } ),
			GSUgetTemplate( "gsui-synthesizer-headTab", { id: "env gain", name: "gain" } ),
			GSUgetTemplate( "gsui-synthesizer-headTab", { id: "env detune", name: "pitch" } ),
			GSUgetTemplate( "gsui-synthesizer-headTab", { id: "env lowpass", name: "lowpass" } ),
		),
		GSUcreateElement( "gsui-envelope" ),
		// .....................................................................
		GSUcreateDiv( { class: "gsuiSynthesizer-head" },
			GSUgetTemplate( "gsui-synthesizer-headTitle", { name: "LFOs", help: "synth-LFOs" } ),
			GSUgetTemplate( "gsui-synthesizer-headTab", { id: "lfo gain", name: "gain" } ),
			GSUgetTemplate( "gsui-synthesizer-headTab", { id: "lfo detune", name: "pitch" } ),
		),
		GSUcreateElement( "gsui-lfo" ),
		// .....................................................................
		GSUcreateDiv( { class: "gsuiSynthesizer-head gsuiSynthesizer-headNoise" },
			GSUgetTemplate( "gsui-synthesizer-headTitle", { name: "noise", help: "synth-noise" } ),
			GSUcreateElement( "gsui-toggle", { off: true } ),
		),
		GSUcreateElement( "gsui-noise" ),
		// .....................................................................
		GSUcreateDiv( { class: "gsuiSynthesizer-head gsuiSynthesizer-headOscs" },
			GSUgetTemplate( "gsui-synthesizer-headTitle", { name: "oscillators", help: "synth-oscillator" } ),
		),
		GSUcreateDiv( { class: "gsuiSynthesizer-oscList" },
			GSUcreateButton( { class: "gsuiSynthesizer-newOsc" },
				GSUcreateIcon( { icon: "plus" } ),
			),
		),
	),
	GSUcreateDiv( { class: "gsuiSynthesizer-shadowBottom" } ),
] );

GSUsetTemplate( "gsui-synthesizer-headTitle", p =>
	GSUcreateSpan( { class: "gsuiSynthesizer-headTitle" },
		GSUcreateSpan( { class: "gsuiSynthesizer-headExpand" }, p.name ),
		GSUcreateElement( "gsui-help-link", { page: p.help } ),
	)
);

GSUsetTemplate( "gsui-synthesizer-headTab", p =>
	GSUcreateDiv( { class: "gsuiSynthesizer-headTab", "data-tab": p.id },
		GSUcreateElement( "gsui-toggle", { off: true } ),
		GSUcreateSpan( { inert: true }, p.name ),
	)
);
