"use strict";

$.$setTemplate( "gsui-tempo", () =>
	$.$button( { title: "Edit the time signature and BPM" },
		$.$div( { class: "gsuiTempo-timeDivision" },
			$.$span( { class: "gsuiTempo-beatsPerMeasure" } ),
			$.$span( { class: "gsuiTempo-stepsPerBeat" } ),
		),
		$.$span( { class: "gsuiTempo-bpm" } ),
	),
);

$.$setTemplate( "gsui-tempo-dropdown", () =>
	$.$elem( "form", { class: "gsuiTempo-popup", tabindex: -1 },
		$.$div( null,
			$.$label( null, "Beats per measure" ),
			$.$input( { type: "number", min: 1, max: 16, required: true } ),
		),
		$.$div( null,
			$.$label( null, "Steps per beat" ),
			$.$input( { type: "number", min: 1, max: 16, required: true } ),
		),
		$.$div( { class: "gsuiTempo-popup-bpm" },
			$.$label( null, "BPM " ),
			$.$div( null,
				$.$input( { type: "number", step: .01, min: 1, max: 999.99, required: true } ),
				$.$button( { icon: "tint" } ),
			),
		),
		$.$div( null,
			$.$button( { type: "submit" }, "Ok" ),
		),
	),
);
