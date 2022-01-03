"use strict";

GSUI.setTemplate( "gsui-daw-popup-settings", () => (
	GSUI.createElement( "div", { class: "gsuiDAW-popup-settings" },
		GSUI.createElement( "fieldset", null,
			GSUI.createElement( "legend", null, "Audio" ),
			GSUI.createElement( "div", { class: "gsuiPopup-row" },
				GSUI.createElement( "div", { class: "gsuiPopup-row-title" }, "Feedback sample rate" ),
				GSUI.createElement( "div", { class: "gsuiPopup-row-values" },
					GSUI.createElement( "select", { class: "gsuiDAW-sampleRate", name: "sampleRate" },
						GSUI.createElement( "option", { value: 8000 }, "8 kHz" ),
						GSUI.createElement( "option", { value: 11025 }, "11.025 kHz" ),
						GSUI.createElement( "option", { value: 12000 }, "12 kHz" ),
						GSUI.createElement( "option", { value: 22050 }, "22.05 kHz" ),
						GSUI.createElement( "option", { value: 24000 }, "24 kHz" ),
						GSUI.createElement( "option", { value: 44100 }, "44.1 kHz" ),
						GSUI.createElement( "option", { value: 48000, style: "font-weight:bold" }, "48 kHz" ),
						GSUI.createElement( "option", { value: 88200 }, "88.2 kHz" ),
						GSUI.createElement( "option", { value: 96000 }, "96 kHz" ),
					),
				),
			),
		),
		GSUI.createElement( "fieldset", null,
			GSUI.createElement( "legend", null, "UI refresh rate" ),
			GSUI.createElement( "div", { class: "gsuiPopup-row" },
				GSUI.createElement( "div", { class: "gsuiPopup-row-title" }, "Auto" ),
				GSUI.createElement( "div", { class: "gsuiPopup-row-values" },
					GSUI.createElement( "label", null,
						GSUI.createElement( "input", { name: "gsuiDAW-uirate", type: "radio", value: "auto" } ),
						GSUI.createElement( "span", { class: "gsuiDAW-uirateFps" }, 60 ),
					),
				),
			),
			GSUI.createElement( "div", { class: "gsuiPopup-row" },
				GSUI.createElement( "div", { class: "gsuiPopup-row-title" }, "Manual" ),
				GSUI.createElement( "div", { class: "gsuiPopup-row-values" },
					GSUI.createElement( "label", null,
						GSUI.createElement( "input", { name: "gsuiDAW-uirate", type: "radio", value: "manual" } ),
						GSUI.createElement( "span", { class: "gsuiDAW-uirateFps" } ),
					),
					GSUI.createElement( "input", { name: "gsuiDAW-uirate-range", type: "range", step: 1, min: 5, max: 40 } ),
				),
			),
		),
		GSUI.createElement( "fieldset", null,
			GSUI.createElement( "legend", null, "Windows" ),
			GSUI.createElement( "div", { class: "gsuiPopup-row" },
				GSUI.createElement( "div", { class: "gsuiPopup-row-title" }, "Move/resize mode" ),
				GSUI.createElement( "div", { class: "gsuiPopup-row-values" },
					GSUI.createElement( "label", null,
						GSUI.createElement( "input", { name: "gsuiDAW-windowsMoveMode", type: "checkbox" } ),
						GSUI.createElement( "span", null, "direct" ),
					),
				),
			),
		),
		GSUI.createElement( "fieldset", null,
			GSUI.createElement( "legend", null, "Timeline" ),
			GSUI.createElement( "div", { class: "gsuiPopup-row" },
				GSUI.createElement( "div", { class: "gsuiPopup-row-title" }, "Numbering measures starting at" ),
				GSUI.createElement( "div", { class: "gsuiPopup-row-values" },
					GSUI.createElement( "select", { name: "gsuiDAW-timelineNumbering" },
						GSUI.createElement( "option", { value: 0 }, 0 ),
						GSUI.createElement( "option", { value: 1 }, 1 ),
					),
				),
			),
		),
	)
) );
