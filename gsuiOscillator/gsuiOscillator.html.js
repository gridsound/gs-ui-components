"use strict";

GSUI.setTemplate( "gsui-oscillator", () => {
	return [
		GSUI.createElem( "div", { class: "gsuiOscillator-grip gsuiIcon", "data-icon": "grip-v" } ),
		GSUI.createElem( "div", { class: "gsuiOscillator-wave" },
			GSUI.createElem( "gsui-periodicwave" ),
			GSUI.createElem( "gsui-periodicwave" ),
		),
		GSUI.createElem( "button", { class: "gsuiOscillator-waveBtn gsuiOscillator-wavePrev gsuiIcon", "data-icon": "caret-left", title: "Previous wave" } ),
		GSUI.createElem( "button", { class: "gsuiOscillator-waveBtn gsuiOscillator-waveNext gsuiIcon", "data-icon": "caret-right", title: "Next wave" } ),
		GSUI.createElem( "select", { class: "gsuiOscillator-waveSelect" },
			[ "sine", "triangle", "sawtooth", "square" ].map( w =>
				GSUI.createElem( "option", { class: "gsuiOscillator-waveOptNative", value: w }, w )
			)
		),
		[
			[ "detune", "pitch", -24, 24, 1 ],
			[ "pan", "pan", -1, 1, .02 ],
			[ "gain", "gain", 0, 1, .01 ],
		].map( ( [ prop, title, min, max, step ] ) =>
			GSUI.createElem( "div", { class: `gsuiOscillator-prop gsuiOscillator-${ prop }`, title },
				GSUI.createElem( "div", { class: "gsuiOscillator-sliderWrap" },
					GSUI.createElem( "gsui-slider", { type: "circular", min, max, step, "mousemove-size": "800", "data-prop": prop } )
				),
				GSUI.createElem( "div", { class: "gsuiOscillator-sliderValue" } ),
			)
		),
		GSUI.createElem( "button", { class: "gsuiOscillator-remove gsuiIcon", "data-icon": "close", title: "Remove the oscillator" } ),
	].flat( 1 );
} );
