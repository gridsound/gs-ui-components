"use strict";

GSUsetTemplate( "gsui-daw-popup-tempo", () =>
	GSUcreateDiv( { class: "gsuiDAW-popup-tempo" },
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Time division / BPM" ),
			GSUcreateDiv( { class: "gsuiPopup-row" },
				GSUcreateDiv( { class: "gsuiPopup-row-title" }, "Beats per measure" ),
				GSUcreateDiv( { class: "gsuiPopup-row-values" },
					GSUcreateInput( { class: "gsuiPopup-inputText", name: "beatsPerMeasure", type: "number", min: 1, max: 16, } ),
				),
			),
			GSUcreateDiv( { class: "gsuiPopup-row" },
				GSUcreateDiv( { class: "gsuiPopup-row-title" }, "Steps per beat" ),
				GSUcreateDiv( { class: "gsuiPopup-row-values" },
					GSUcreateInput( { class: "gsuiPopup-inputText", name: "stepsPerBeat", type: "number", min: 1, max: 16, } ),
				),
			),
			GSUcreateDiv( { class: "gsuiPopup-row" },
				GSUcreateDiv( { class: "gsuiPopup-row-title" }, "BPM (Beats Per Minute)" ),
				GSUcreateDiv( { class: "gsuiPopup-row-values" },
					GSUcreateInput( { class: "gsuiPopup-inputText", name: "bpm", type: "number", min: 1, max: 999.99, step: .01 } ),
					GSUcreateButton( { class: "gsuiDAW-bpmTap gsuiIcon", "data-icon": "tint" } ),
				),
			),
		),
	)
);
