"use strict";

GSUsetTemplate( "gsui-daw-popup-settings", () =>
	GSUcreateDiv( { class: "gsuiDAW-popup-settings" },
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Audio" ),
			GSUcreateDiv( { class: "gsuiPopup-row" },
				GSUcreateDiv( { class: "gsuiPopup-row-title" }, "Feedback sample rate" ),
				GSUcreateDiv( { class: "gsuiPopup-row-values" },
					GSUcreateSelect( { name: "sampleRate" },
						GSUcreateOption( { value: 8000 }, "8 kHz" ),
						GSUcreateOption( { value: 11025 }, "11.025 kHz" ),
						GSUcreateOption( { value: 12000 }, "12 kHz" ),
						GSUcreateOption( { value: 22050 }, "22.05 kHz" ),
						GSUcreateOption( { value: 24000 }, "24 kHz" ),
						GSUcreateOption( { value: 44100 }, "44.1 kHz" ),
						GSUcreateOption( { value: 48000, style: "font-weight:bold" }, "48 kHz" ),
						GSUcreateOption( { value: 88200 }, "88.2 kHz" ),
						GSUcreateOption( { value: 96000 }, "96 kHz" ),
					),
				),
			),
		),
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "UI refresh rate" ),
			GSUcreateDiv( { class: "gsuiPopup-row" },
				GSUcreateDiv( { class: "gsuiPopup-row-title" }, "Auto" ),
				GSUcreateDiv( { class: "gsuiPopup-row-values" },
					GSUcreateLabel( null,
						GSUcreateInput( { name: "uiRate", type: "radio", value: "auto" } ),
						GSUcreateSpan( { class: "gsuiDAW-uiRateFps" }, 60 ),
					),
				),
			),
			GSUcreateDiv( { class: "gsuiPopup-row" },
				GSUcreateDiv( { class: "gsuiPopup-row-title" }, "Manual" ),
				GSUcreateDiv( { class: "gsuiPopup-row-values" },
					GSUcreateLabel( null,
						GSUcreateInput( { name: "uiRate", type: "radio", value: "manual" } ),
						GSUcreateSpan( { class: "gsuiDAW-uiRateFps" }, 40 ),
					),
					GSUcreateInput( { name: "uiRateFPS", type: "range", step: 1, min: 5, max: 40, value: 40 } ),
				),
			),
		),
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Windows" ),
			GSUcreateDiv( { class: "gsuiPopup-row" },
				GSUcreateDiv( { class: "gsuiPopup-row-title" }, "Move/resize mode" ),
				GSUcreateDiv( { class: "gsuiPopup-row-values" },
					GSUcreateLabel( null,
						GSUcreateInput( { name: "windowsLowGraphics", type: "checkbox" } ),
						GSUcreateSpan( null, "low graphic" ),
					),
				),
			),
		),
		GSUcreateElement( "fieldset", null,
			GSUcreateElement( "legend", null, "Notations" ),
			GSUcreateDiv( { class: "gsuiPopup-row" },
				GSUcreateDiv( { class: "gsuiPopup-row-title" }, "Numbering measures starting at" ),
				GSUcreateDiv( { class: "gsuiPopup-row-values" },
					GSUcreateSelect( { name: "timelineNumbering" },
						GSUcreateOption( { value: 0 } ),
						GSUcreateOption( { value: 1 } ),
					),
				),
			),
			GSUcreateDiv( { class: "gsuiPopup-row" },
				GSUcreateDiv( { class: "gsuiPopup-row-title" }, "Key notation" ),
				GSUcreateDiv( { class: "gsuiPopup-row-values" },
					GSUcreateSelect( { name: "keyNotation" },
						GSUcreateOption( { value: "DoRéMi" },  "do ré mi fa sol la si" ),
						GSUcreateOption( { value: "UtRéMi" },  "ut ré mi fa sol la si" ),
						GSUcreateOption( { value: "CDEFGAB" }, "C D E F G A B" ),
						GSUcreateOption( { value: "CDEFGAH" }, "C D E F G A H" ),
						GSUcreateOption( { value: "OneTwo" },  "1 2 3 4 5 6 7" ),
					),
				),
			),
		),
	)
);
