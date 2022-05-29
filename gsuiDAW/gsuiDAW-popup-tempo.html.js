"use strict";

GSUI.$setTemplate( "gsui-daw-popup-tempo", () =>
	GSUI.$createElement( "div", { class: "gsuiDAW-popup-tempo" },
		GSUI.$createElement( "fieldset", null,
			GSUI.$createElement( "legend", null, "Time division / BPM" ),
			GSUI.$createElement( "div", { class: "gsuiPopup-row" },
				GSUI.$createElement( "div", { class: "gsuiPopup-row-title" }, "Beats per measure" ),
				GSUI.$createElement( "div", { class: "gsuiPopup-row-values" },
					GSUI.$createElement( "input", { class: "gsuiPopup-inputText", name: "beatsPerMeasure", type: "number", min: 1, max: 16, } ),
				),
			),
			GSUI.$createElement( "div", { class: "gsuiPopup-row" },
				GSUI.$createElement( "div", { class: "gsuiPopup-row-title" }, "Steps per beat" ),
				GSUI.$createElement( "div", { class: "gsuiPopup-row-values" },
					GSUI.$createElement( "input", { class: "gsuiPopup-inputText", name: "stepsPerBeat", type: "number", min: 1, max: 16, } ),
				),
			),
			GSUI.$createElement( "div", { class: "gsuiPopup-row" },
				GSUI.$createElement( "div", { class: "gsuiPopup-row-title" }, "BPM (Beats Per Minute)" ),
				GSUI.$createElement( "div", { class: "gsuiPopup-row-values" },
					GSUI.$createElement( "input", { class: "gsuiPopup-inputText", name: "bpm", type: "number", min: 1, max: 999.99, step: .01 } ),
					GSUI.$createElement( "a", { class: "gsuiDAW-bpmTap gsuiIcon", "data-icon": "tint" } ),
				),
			),
		),
	)
);
