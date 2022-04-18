"use strict";

GSUI.setTemplate( "gsui-synthesizer", () => {
	return [
		GSUI.createElem( "div", { class: "gsuiSynthesizer-env" }, GSUI.createElem( "gsui-envelope" ) ),
		GSUI.createElem( "div", { class: "gsuiSynthesizer-lfo" }, GSUI.createElem( "gsui-lfo" ) ),
		GSUI.createElem( "div", { class: "gsuiSynthesizer-head gsuiSynthesizer-headOscs" },
			GSUI.createElem( "span", { class: "gsuiSynthesizer-headTitle" }, "oscillators" ),
			GSUI.createElem( "span", { class: "gsuiSynthesizer-label gsuiSynthesizer-labelPitch" }, "pitch" ),
			GSUI.createElem( "span", { class: "gsuiSynthesizer-label gsuiSynthesizer-labelPan" }, "pan" ),
			GSUI.createElem( "span", { class: "gsuiSynthesizer-label gsuiSynthesizer-labelGain" }, "gain" ),
		),
		GSUI.createElem( "div", { class: "gsuiSynthesizer-oscList" },
			GSUI.createElem( "button", { class: "gsuiSynthesizer-newOsc" },
				GSUI.createElem( "i", { class: "gsuiIcon", "data-icon": "plus" } ),
			),
		),
	];
} );
