"use strict";

GSUsetTemplate( "gsui-oscillator", waves => {
	return [
		GSUcreateDiv( { class: "gsuiOscillator-grip gsuiIcon", "data-icon": "grip-v" } ),
		GSUcreateDiv( { class: "gsuiOscillator-waveWrap" },
			GSUcreateDiv( { class: "gsuiOscillator-wave-dragExtra" } ),
			GSUcreateDiv( { class: "gsuiOscillator-waveWrap-left" },
				GSUcreateDiv( { class: "gsuiOscillator-waveWrap-top" },
					GSUcreateButton( { class: "gsuiOscillator-waveBtn gsuiOscillator-wavePrev gsuiIcon", "data-icon": "caret-left", title: "Previous wave" } ),
					GSUcreateButton( { class: "gsuiOscillator-waveBtn gsuiOscillator-waveNext gsuiIcon", "data-icon": "caret-right", title: "Next wave" } ),
					GSUcreateSelect( { class: "gsuiOscillator-waveSelect" },
						waves.map( w => GSUcreateOption( { class: "gsuiOscillator-waveOptNative", value: w } ) )
					),
				),
				GSUcreateDiv( { class: "gsuiOscillator-wave" },
					GSUcreateElement( "gsui-periodicwave" ),
					GSUcreateElement( "gsui-periodicwave" ),
				),
			),
			GSUcreateDiv( { class: "gsuiOscillator-unisonGraph" },
				GSUcreateDiv( { class: "gsuiOscillator-unisonGraph-voices" } ),
			),
			GSUcreateDiv( { class: "gsuiOscillator-wave-dragging" },
				GSUcreateI( { class: "gsuiIcon", "data-icon": "arrow-dropdown", animate: true } ),
			),
		),
		GSUcreateDiv( { class: "gsuiOscillator-unison" },
			GSUcreateElement( "gsui-slider", { type: "linear-y", min: 1, max: 9, step: 1, "mousemove-size": "400", "data-prop": "unisonvoices" } ),
			GSUcreateElement( "gsui-slider", { type: "linear-y", min: 0, max: 2, step: .01, "mousemove-size": "800", "data-prop": "unisondetune" } ),
			GSUcreateElement( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .001, "mousemove-size": "800", "data-prop": "unisonblend" } ),
		),
		[
			[ "detune", "pitch", -24, 24, 1 ],
			[ "pan", "pan", -1, 1, .02 ],
			[ "gain", "gain", 0, 1, .01 ],
		].map( ( [ prop, title, min, max, step ] ) =>
			GSUcreateDiv( { class: `gsuiOscillator-prop gsuiOscillator-${ prop }`, title },
				GSUcreateDiv( { class: "gsuiOscillator-sliderWrap" },
					GSUcreateElement( "gsui-slider", { type: "circular", min, max, step, "mousemove-size": "800", "data-prop": prop } ),
					prop !== "detune" ? null : GSUcreateElement( "gsui-slider", { type: "circular", min: -1, max: 1, step: .01, "mousemove-size": "800", "data-prop": "detunefine", "stroke-width": 3 } )
				),
				GSUcreateDiv( { class: "gsuiOscillator-sliderValue" } ),
			)
		),
		GSUcreateButton( { class: "gsuiOscillator-remove gsuiIcon", "data-icon": "close", title: "Remove the oscillator" } ),
		GSUcreateDiv( { class: "gsuiOscillator-dragging" },
			GSUcreateI( { class: "gsuiIcon", "data-icon": "arrow-dropdown", animate: true } ),
		),
	].flat( 1 );
} );
