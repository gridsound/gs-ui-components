"use strict";

GSUsetTemplate( "gsui-synthesizer", () => [
	GSUcreateDiv( { class: "gsuiSynthesizer-shadowTop" } ),
	GSUcreateDiv( { class: "gsuiSynthesizer-scrollArea" },
		// .....................................................................
		GSUcreateDiv( { class: "gsuiSynthesizer-head" },
			GSUgetTemplate( "gsui-synthesizer-headTitle", { name: "envelopes", help: "synth-envelopes" } ),
			GSUgetTemplate( "gsui-synthesizer-headTab", { id: "env gain", name: "gain" } ),
			GSUgetTemplate( "gsui-synthesizer-headTab", { id: "env detune", name: "pitch" } ),
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
			GSUcreateSpan( { class: "gsuiSynthesizer-label gsuiSynthesizer-labelUnison" }, "unison" ),
			GSUcreateSpan( { class: "gsuiSynthesizer-label gsuiSynthesizer-labelPitch" }, "pitch" ),
			GSUcreateSpan( { class: "gsuiSynthesizer-label gsuiSynthesizer-labelPan" }, "pan" ),
			GSUcreateSpan( { class: "gsuiSynthesizer-label gsuiSynthesizer-labelGain" }, "gain" ),
		),
		GSUcreateDiv( { class: "gsuiSynthesizer-oscList" },
			GSUcreateButton( { class: "gsuiSynthesizer-newOsc" },
				GSUcreateI( { class: "gsuiIcon", "data-icon": "plus", inert: true } ),
			),
		),
	),
	GSUcreateDiv( { class: "gsuiSynthesizer-shadowBottom" } ),
] );

GSUsetTemplate( "gsui-synthesizer-headTitle", p =>
	GSUcreateSpan( { class: "gsuiSynthesizer-headTitle" },
		GSUcreateSpan( null, p.name ),
		GSUcreateElement( "gsui-help-link", { page: p.help } ),
	)
);

GSUsetTemplate( "gsui-synthesizer-headTab", p =>
	GSUcreateDiv( { class: "gsuiSynthesizer-headTab", "data-tab": p.id },
		GSUcreateElement( "gsui-toggle", { off: true } ),
		GSUcreateSpan( { inert: true }, p.name ),
	)
);
