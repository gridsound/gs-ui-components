"use strict";

GSUsetTemplate( "gsui-synthesizer", () => {
	return [
		GSUcreateDiv( { class: "gsuiSynthesizer-head" },
			GSUcreateElement( "gsui-toggle", { "data-related": "env", off: true } ),
			GSUcreateSpan( { class: "gsuiSynthesizer-headTitle" }, "envelope gain" ),
		),
		GSUcreateDiv( { class: "gsuiSynthesizer-env" }, GSUcreateElement( "gsui-envelope" ) ),
		GSUcreateDiv( { class: "gsuiSynthesizer-head" },
			GSUcreateElement( "gsui-toggle", { "data-related": "lfo", off: true } ),
			GSUcreateSpan( { class: "gsuiSynthesizer-headTitle" }, "LFO gain" ),
		),
		GSUcreateDiv( { class: "gsuiSynthesizer-lfo" }, GSUcreateElement( "gsui-lfo" ) ),
		GSUcreateDiv( { class: "gsuiSynthesizer-head gsuiSynthesizer-headOscs" },
			GSUcreateSpan( { class: "gsuiSynthesizer-headTitle" }, "oscillators" ),
			GSUcreateSpan( { class: "gsuiSynthesizer-label gsuiSynthesizer-labelUnison" }, "unison" ),
			GSUcreateSpan( { class: "gsuiSynthesizer-label gsuiSynthesizer-labelPitch" }, "pitch" ),
			GSUcreateSpan( { class: "gsuiSynthesizer-label gsuiSynthesizer-labelPan" }, "pan" ),
			GSUcreateSpan( { class: "gsuiSynthesizer-label gsuiSynthesizer-labelGain" }, "gain" ),
		),
		GSUcreateDiv( { class: "gsuiSynthesizer-oscList" },
			GSUcreateButton( { class: "gsuiSynthesizer-newOsc" },
				GSUcreateI( { class: "gsuiIcon", "data-icon": "plus" } ),
			),
		),
	];
} );
