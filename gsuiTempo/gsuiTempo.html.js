"use strict";

GSUsetTemplate( "gsui-tempo", () =>
	GSUcreateButton( { class: "gsuiTempo-btn", title: "Edit the time signature and BPM" },
		GSUcreateDiv( { class: "gsuiTempo-timeDivision" },
			GSUcreateSpan( { class: "gsuiTempo-beatsPerMeasure" } ),
			GSUcreateSpan( { class: "gsuiTempo-stepsPerBeat" } ),
		),
		GSUcreateSpan( { class: "gsuiTempo-bpm" } ),
	),
);

GSUsetTemplate( "gsui-tempo-dropdown", () =>
	GSUcreateElement( "form", { class: "gsuiTempo-popup", tabindex: -1 },
		GSUcreateDiv( { class: "gsuiTempo-row" },
			GSUcreateLabel( null, "Beats per measure" ),
			GSUcreateInput( { type: "number", min: 1, max: 16, required: true } ),
		),
		GSUcreateDiv( { class: "gsuiTempo-row" },
			GSUcreateLabel( null, "Steps per beat" ),
			GSUcreateInput( { type: "number", min: 1, max: 16, required: true } ),
		),
		GSUcreateDiv( { class: "gsuiTempo-row gsuiTempo-row-bpm" },
			GSUcreateLabel( null, "BPM " ),
			GSUcreateDiv( null,
				GSUcreateInput( { type: "number", step: .01, min: 1, max: 999.99, required: true } ),
				GSUcreateButton( { class: "gsuiTempo-tap", icon: "tint" } ),
			),
		),
		GSUcreateDiv( { class: "gsuiTempo-row" },
			GSUcreateButton( { type: "submit" }, "Ok" ),
		),
	),
);
