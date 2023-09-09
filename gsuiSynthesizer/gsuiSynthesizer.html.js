"use strict";

GSUsetTemplate( "gsui-synthesizer", () => {
	return [
		GSUcreateElement( "div", { class: "gsuiSynthesizer-head" },
			GSUcreateElement( "gsui-toggle", { "data-related": "env", off: true } ),
			GSUcreateElement( "span", { class: "gsuiSynthesizer-headTitle" }, "envelope gain" ),
		),
		GSUcreateElement( "div", { class: "gsuiSynthesizer-env" }, GSUcreateElement( "gsui-envelope" ) ),
		GSUcreateElement( "div", { class: "gsuiSynthesizer-head" },
			GSUcreateElement( "gsui-toggle", { "data-related": "lfo", off: true } ),
			GSUcreateElement( "span", { class: "gsuiSynthesizer-headTitle" }, "LFO gain" ),
		),
		GSUcreateElement( "div", { class: "gsuiSynthesizer-lfo" }, GSUcreateElement( "gsui-lfo" ) ),
		GSUcreateElement( "div", { class: "gsuiSynthesizer-head gsuiSynthesizer-headOscs" },
			GSUcreateElement( "span", { class: "gsuiSynthesizer-headTitle" }, "oscillators" ),
			GSUcreateElement( "span", { class: "gsuiSynthesizer-label gsuiSynthesizer-labelUnison" }, "unison" ),
			GSUcreateElement( "span", { class: "gsuiSynthesizer-label gsuiSynthesizer-labelPitch" }, "pitch" ),
			GSUcreateElement( "span", { class: "gsuiSynthesizer-label gsuiSynthesizer-labelPan" }, "pan" ),
			GSUcreateElement( "span", { class: "gsuiSynthesizer-label gsuiSynthesizer-labelGain" }, "gain" ),
		),
		GSUcreateElement( "div", { class: "gsuiSynthesizer-oscList" },
			GSUcreateButton( { class: "gsuiSynthesizer-newOsc" },
				GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "plus" } ),
			),
		),
	];
} );
