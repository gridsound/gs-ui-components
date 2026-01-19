"use strict";

GSUsetTemplate( "gsui-tempo", () =>
	GSUcreateButton( { title: "Edit the time signature and BPM" },
		GSUcreateDiv( { class: "gsuiTempo-timeDivision" },
			GSUcreateSpan( { class: "gsuiTempo-beatsPerMeasure" } ),
			GSUcreateSpan( { class: "gsuiTempo-stepsPerBeat" } ),
		),
		GSUcreateSpan( { class: "gsuiTempo-bpm" } ),
	),
);

GSUsetTemplate( "gsui-tempo-dropdown", () =>
	GSUcreateElement( "form", { class: "gsuiTempo-popup", tabindex: -1 },
		GSUcreateDiv( null,
			GSUcreateLabel( null, "Beats per measure" ),
			GSUcreateInput( { type: "number", min: 1, max: 16, required: true } ),
		),
		GSUcreateDiv( null,
			GSUcreateLabel( null, "Steps per beat" ),
			GSUcreateInput( { type: "number", min: 1, max: 16, required: true } ),
		),
		GSUcreateDiv( { class: "gsuiTempo-popup-bpm" },
			GSUcreateLabel( null, "BPM " ),
			GSUcreateDiv( null,
				GSUcreateInput( { type: "number", step: .01, min: 1, max: 999.99, required: true } ),
				GSUcreateButton( { icon: "tint" } ),
			),
		),
		GSUcreateDiv( null,
			GSUcreateButton( { type: "submit" }, "Ok" ),
		),
	),
);
