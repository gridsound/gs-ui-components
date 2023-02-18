"use strict";

GSUI.$setTemplate( "gsui-oscillator", () => {
	return [
		GSUI.$createElement( "div", { class: "gsuiOscillator-grip gsuiIcon", "data-icon": "grip-v" } ),
		GSUI.$createElement( "div", { class: "gsuiOscillator-waveWrap" },
			GSUI.$createElement( "div", { class: "gsuiOscillator-waveWrap-left" },
				GSUI.$createElement( "div", { class: "gsuiOscillator-waveWrap-top" },
					GSUI.$createElement( "button", { class: "gsuiOscillator-waveBtn gsuiOscillator-wavePrev gsuiIcon", "data-icon": "caret-left", title: "Previous wave" } ),
					GSUI.$createElement( "button", { class: "gsuiOscillator-waveBtn gsuiOscillator-waveNext gsuiIcon", "data-icon": "caret-right", title: "Next wave" } ),
					GSUI.$createElement( "select", { class: "gsuiOscillator-waveSelect" },
						[ "sine", "triangle", "sawtooth", "square" ].map( w =>
							GSUI.$createElement( "option", { class: "gsuiOscillator-waveOptNative", value: w }, w )
						)
					),
				),
				GSUI.$createElement( "div", { class: "gsuiOscillator-wave" },
					GSUI.$createElement( "gsui-periodicwave" ),
					GSUI.$createElement( "gsui-periodicwave" ),
				),
			),
			GSUI.$createElement( "div", { class: "gsuiOscillator-unisonGraph" },
				GSUI.$createElement( "div", { class: "gsuiOscillator-unisonGraph-voices" } ),
			),
		),
		GSUI.$createElement( "div", { class: "gsuiOscillator-unison" },
			GSUI.$createElement( "gsui-slider", { type: "linear-y", min: 1, max: 9, step: 1, "mousemove-size": "400", "data-prop": "unisonvoices" } ),
			GSUI.$createElement( "gsui-slider", { type: "linear-y", min: 0, max: 2, step: .01, "mousemove-size": "800", "data-prop": "unisondetune" } ),
			GSUI.$createElement( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .001, "mousemove-size": "800", "data-prop": "unisonblend" } ),
		),
		[
			[ "detune", "pitch", -24, 24, 1 ],
			[ "pan", "pan", -1, 1, .02 ],
			[ "gain", "gain", 0, 1, .01 ],
		].map( ( [ prop, title, min, max, step ] ) =>
			GSUI.$createElement( "div", { class: `gsuiOscillator-prop gsuiOscillator-${ prop }`, title },
				GSUI.$createElement( "div", { class: "gsuiOscillator-sliderWrap" },
					GSUI.$createElement( "gsui-slider", { type: "circular", min, max, step, "mousemove-size": "800", "data-prop": prop } ),
					prop !== "detune" ? null : GSUI.$createElement( "gsui-slider", { type: "circular", min: -1, max: 1, step: .01, "mousemove-size": "800", "data-prop": "detunefine", "stroke-width": 3 } )
				),
				GSUI.$createElement( "div", { class: "gsuiOscillator-sliderValue" } ),
			)
		),
		GSUI.$createElement( "button", { class: "gsuiOscillator-remove gsuiIcon", "data-icon": "close", title: "Remove the oscillator" } ),
	].flat( 1 );
} );
