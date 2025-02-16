"use strict";

GSUsetTemplate( "gsui-synthesizer", () => [
	GSUcreateDiv( { class: "gsuiSynthesizer-shadowTop" } ),
	GSUcreateDiv( { class: "gsuiSynthesizer-scrollArea" },
		// .....................................................................
		GSUcreateDiv( { class: "gsuiSynthesizer-head" },
			GSUcreateSpan( { class: "gsuiSynthesizer-headTitle" }, "envelopes" ),
			GSUcreateDiv( { class: "gsuiSynthesizer-headTab", "data-tab": "env gain" },
				GSUcreateElement( "gsui-toggle", { off: true } ),
				GSUcreateSpan( { inert: true }, "gain" ),
			),
			GSUcreateDiv( { class: "gsuiSynthesizer-headTab", "data-tab": "env detune" },
				GSUcreateElement( "gsui-toggle", { off: true } ),
				GSUcreateSpan( { inert: true }, "pitch" ),
			),
		),
		GSUcreateElement( "gsui-envelope" ),
		// .....................................................................
		GSUcreateDiv( { class: "gsuiSynthesizer-head" },
			GSUcreateSpan( { class: "gsuiSynthesizer-headTitle" }, "LFO" ),
			GSUcreateDiv( { class: "gsuiSynthesizer-headTab", "data-tab": "lfo gain" },
				GSUcreateElement( "gsui-toggle", { off: true } ),
				GSUcreateSpan( { inert: true }, "gain" ),
			),
			GSUcreateDiv( { class: "gsuiSynthesizer-headTab", "data-tab": "lfo detune" },
				GSUcreateElement( "gsui-toggle", { off: true } ),
				GSUcreateSpan( { inert: true }, "pitch" ),
			),
		),
		GSUcreateElement( "gsui-lfo" ),
		// .....................................................................
		GSUcreateDiv( { class: "gsuiSynthesizer-head gsuiSynthesizer-headNoise" },
			GSUcreateSpan( { class: "gsuiSynthesizer-headTitle" }, "noise" ),
			GSUcreateElement( "gsui-toggle", { off: true } ),
		),
		GSUcreateElement( "gsui-noise" ),
		// .....................................................................
		GSUcreateDiv( { class: "gsuiSynthesizer-head gsuiSynthesizer-headOscs" },
			GSUcreateSpan( { class: "gsuiSynthesizer-headTitle" }, "oscillators" ),
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
