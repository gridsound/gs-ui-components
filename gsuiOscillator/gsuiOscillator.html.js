"use strict";

GSUsetTemplate( "gsui-oscillator", waves => {
	return [
		GSUcreateElement( "div", { class: "gsuiOscillator-grip gsuiIcon", "data-icon": "grip-v" } ),
		GSUcreateElement( "div", { class: "gsuiOscillator-waveWrap" },
			GSUcreateElement( "div", { class: "gsuiOscillator-waveWrap-left" },
				GSUcreateElement( "div", { class: "gsuiOscillator-waveWrap-top" },
					GSUcreateElement( "button", { class: "gsuiOscillator-waveBtn gsuiOscillator-wavePrev gsuiIcon", "data-icon": "caret-left", title: "Previous wave" } ),
					GSUcreateElement( "button", { class: "gsuiOscillator-waveBtn gsuiOscillator-waveNext gsuiIcon", "data-icon": "caret-right", title: "Next wave" } ),
					GSUcreateElement( "select", { class: "gsuiOscillator-waveSelect" },
						waves.map( w => GSUcreateElement( "option", { class: "gsuiOscillator-waveOptNative", value: w }, w ) )
					),
				),
				GSUcreateElement( "div", { class: "gsuiOscillator-wave" },
					GSUcreateElement( "gsui-periodicwave" ),
					GSUcreateElement( "gsui-periodicwave" ),
				),
			),
			GSUcreateElement( "div", { class: "gsuiOscillator-unisonGraph" },
				GSUcreateElement( "div", { class: "gsuiOscillator-unisonGraph-voices" } ),
			),
		),
		GSUcreateElement( "div", { class: "gsuiOscillator-unison" },
			GSUcreateElement( "gsui-slider", { type: "linear-y", min: 1, max: 9, step: 1, "mousemove-size": "400", "data-prop": "unisonvoices" } ),
			GSUcreateElement( "gsui-slider", { type: "linear-y", min: 0, max: 2, step: .01, "mousemove-size": "800", "data-prop": "unisondetune" } ),
			GSUcreateElement( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .001, "mousemove-size": "800", "data-prop": "unisonblend" } ),
		),
		[
			[ "detune", "pitch", -24, 24, 1 ],
			[ "pan", "pan", -1, 1, .02 ],
			[ "gain", "gain", 0, 1, .01 ],
		].map( ( [ prop, title, min, max, step ] ) =>
			GSUcreateElement( "div", { class: `gsuiOscillator-prop gsuiOscillator-${ prop }`, title },
				GSUcreateElement( "div", { class: "gsuiOscillator-sliderWrap" },
					GSUcreateElement( "gsui-slider", { type: "circular", min, max, step, "mousemove-size": "800", "data-prop": prop } ),
					prop !== "detune" ? null : GSUcreateElement( "gsui-slider", { type: "circular", min: -1, max: 1, step: .01, "mousemove-size": "800", "data-prop": "detunefine", "stroke-width": 3 } )
				),
				GSUcreateElement( "div", { class: "gsuiOscillator-sliderValue" } ),
			)
		),
		GSUcreateElement( "button", { class: "gsuiOscillator-remove gsuiIcon", "data-icon": "close", title: "Remove the oscillator" } ),
	].flat( 1 );
} );
