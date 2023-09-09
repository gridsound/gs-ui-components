"use strict";

GSUsetTemplate( "gsui-daw-popup-tempo", () =>
	GSUcreateElement( "div", { class: "gsuiDAW-popup-tempo" },
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Time division / BPM" ),
			GSUcreateElement( "div", { class: "gsuiPopup-row" },
				GSUcreateElement( "div", { class: "gsuiPopup-row-title" }, "Beats per measure" ),
				GSUcreateElement( "div", { class: "gsuiPopup-row-values" },
					GSUcreateElement( "input", { class: "gsuiPopup-inputText", name: "beatsPerMeasure", type: "number", min: 1, max: 16, } ),
				),
			),
			GSUcreateElement( "div", { class: "gsuiPopup-row" },
				GSUcreateElement( "div", { class: "gsuiPopup-row-title" }, "Steps per beat" ),
				GSUcreateElement( "div", { class: "gsuiPopup-row-values" },
					GSUcreateElement( "input", { class: "gsuiPopup-inputText", name: "stepsPerBeat", type: "number", min: 1, max: 16, } ),
				),
			),
			GSUcreateElement( "div", { class: "gsuiPopup-row" },
				GSUcreateElement( "div", { class: "gsuiPopup-row-title" }, "BPM (Beats Per Minute)" ),
				GSUcreateElement( "div", { class: "gsuiPopup-row-values" },
					GSUcreateElement( "input", { class: "gsuiPopup-inputText", name: "bpm", type: "number", min: 1, max: 999.99, step: .01 } ),
					GSUcreateA( { class: "gsuiDAW-bpmTap gsuiIcon", "data-icon": "tint" } ),
				),
			),
		),
	)
);
