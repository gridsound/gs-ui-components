"use strict";

GSUsetTemplate( "gsui-oscillator", waves =>
	GSUcreateDiv( { class: "gsuiOscillator-in" },
		GSUcreateDiv( { class: "gsuiOscillator-grip gsuiIcon", "data-icon": "grip-v" } ),
		GSUcreateDiv( { class: "gsuiOscillator-id", inert: true } ),
		GSUcreateSpan( { class: "gsuiOscillator-head-label" }, "unison" ),
		GSUcreateSpan( { class: "gsuiOscillator-head-label" }, "pitch" ),
		GSUcreateSpan( { class: "gsuiOscillator-head-label" }, "pan" ),
		GSUcreateSpan( { class: "gsuiOscillator-head-label" }, "gain" ),
		GSUcreateDiv( { class: "gsuiOscillator-waveColumn" },
			GSUcreateDiv( { class: "gsuiOscillator-waveWrap" },
				GSUcreateDiv( { class: "gsuiOscillator-waveWrap-left" },
					GSUcreateDiv( { class: "gsuiOscillator-waveWrap-top" },
						GSUcreateButton( { class: "gsuiOscillator-waveBtn gsuiOscillator-wavePrev", icon: "caret-left", title: "Previous wave" } ),
						GSUcreateButton( { class: "gsuiOscillator-waveBtn gsuiOscillator-waveNext", icon: "caret-right", title: "Next wave" } ),
						GSUcreateSelect( { class: "gsuiOscillator-waveSelect" },
							waves.map( w => GSUcreateOption( { class: "gsuiOscillator-waveOptNative", value: w } ) ),
						),
						GSUcreateButton( { class: "gsuiOscillator-waveBtn", "data-action": "wavetable", title: "Open wavetable editor" },
							GSUcreateIcon( { icon: "oscillator" } ),
							GSUcreateIcon( { icon: "pen" } ),
						),
						GSUcreateIcon( { class: "gsuiOscillator-sourceIcon", icon: "waveform" } ),
						GSUcreateSpan( { class: "gsuiOscillator-sourceName" } ),
					),
					GSUcreateDiv( { class: "gsuiOscillator-waveWrap-bottom", inert: true },
						GSUcreateDiv( { class: "gsuiOscillator-source" } ),
						GSUcreateDiv( { class: "gsuiOscillator-wave" },
							GSUcreateElement( "gsui-periodicwave" ),
							GSUcreateElement( "gsui-periodicwave" ),
						),
					),
				),
			),
			GSUcreateElement( "gsui-slider", { type: "linear-x", min: 0, max: 1, step: .001, "mousemove-size": "400", "data-prop": "phaze", defaultValue: 0 } ),
		),
		GSUcreateDiv( { class: "gsuiOscillator-unison" },
			GSUcreateDiv( { class: "gsuiOscillator-unisonGraph" },
				GSUcreateDiv( { class: "gsuiOscillator-unisonGraph-voices" } ),
			),
			GSUcreateElement( "gsui-slider", { type: "linear-y", min: 1, max: 9, step: 1, "mousemove-size": "400", "data-prop": "unisonvoices", defaultValue: 1 } ),
			GSUcreateElement( "gsui-slider", { type: "linear-y", min: 0, max: 2, step: .01, "mousemove-size": "800", "data-prop": "unisondetune" } ),
			GSUcreateElement( "gsui-slider", { type: "linear-y", min: 0, max: 1, step: .001, "mousemove-size": "800", "data-prop": "unisonblend" } ),
		),
		[
			[ "detune", "pitch", -24, 24, 1, 0 ],
			[ "pan", "pan", -1, 1, .02, 0 ],
			[ "gain", "gain", 0, 1, .01, 1 ],
		].map( ( [ prop, title, min, max, step, def ] ) =>
			GSUcreateDiv( { class: "gsuiOscillator-prop", "data-prop": prop, title },
				GSUcreateDiv( { class: "gsuiOscillator-sliderWrap" },
					GSUcreateElement( "gsui-slider", { type: "circular", min, max, step, "mousemove-size": "800", "data-prop": prop, defaultValue: def } ),
					prop !== "detune" ? null : GSUcreateElement( "gsui-slider", { type: "circular", min: -1, max: 1, step: .01, "mousemove-size": "800", "data-prop": "detunefine", "stroke-width": 3, defaultValue: 0 } )
				),
				GSUcreateDiv( { class: "gsuiOscillator-sliderValue" } ),
			)
		),
		GSUcreateButton( { class: "gsuiOscillator-remove", icon: "close", title: "Remove the oscillator" } ),
		GSUcreateDiv( { class: "gsuiOscillator-wavetable" } ),
	)
);
