"use strict";

GSUI.setTemplate( "gsui-daw-popup-tempo", () =>
	GSUI.createElem( "div", { class: "gsuiDAW-popup-tempo" },
		GSUI.createElem( "fieldset", null,
			GSUI.createElem( "legend", null, "Time division / BPM" ),
			GSUI.createElem( "div", { class: "gsuiPopup-row" },
				GSUI.createElem( "div", { class: "gsuiPopup-row-title" }, "Beats per measure" ),
				GSUI.createElem( "div", { class: "gsuiPopup-row-values" },
					GSUI.createElem( "input", { class: "gsuiPopup-inputText", name: "beatsPerMeasure", type: "number", min: 1, max: 16, } ),
				),
			),
			GSUI.createElem( "div", { class: "gsuiPopup-row" },
				GSUI.createElem( "div", { class: "gsuiPopup-row-title" }, "Steps per beat" ),
				GSUI.createElem( "div", { class: "gsuiPopup-row-values" },
					GSUI.createElem( "input", { class: "gsuiPopup-inputText", name: "stepsPerBeat", type: "number", min: 1, max: 16, } ),
				),
			),
			GSUI.createElem( "div", { class: "gsuiPopup-row" },
				GSUI.createElem( "div", { class: "gsuiPopup-row-title" }, "BPM (Beats Per Minute)" ),
				GSUI.createElem( "div", { class: "gsuiPopup-row-values" },
					GSUI.createElem( "input", { class: "gsuiPopup-inputText", name: "bpm", type: "number", min: 1, max: 999.99, step: .01 } ),
					GSUI.createElem( "a", { class: "gsuiDAW-bpmTap gsuiIcon", "data-icon": "tint" } ),
				),
			),
		),
	)
);
