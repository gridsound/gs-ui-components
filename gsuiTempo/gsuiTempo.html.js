"use strict";

$.$setTemplate( "gsui-tempo", () => {
	const popId = GSUuuid();

	return [
		$.$button( { popovertarget: popId, "data-tooltip": GSTX.$tempo_edit },
			$.$div( { class: "gsuiTempo-timeDivision" },
				$.$span( { class: "gsuiTempo-beatsPerMeasure" } ),
				$.$span( { class: "gsuiTempo-stepsPerBeat" } ),
			),
			$.$span( { class: "gsuiTempo-bpm" } ),
		),
		$.$elem( "form", { class: "gsuiTempo-form", id: popId, popover: true },
			$.$div( null,
				$.$label( null, "Beats per measure" ),
				$.$input( { type: "number", min: 1, max: 16, required: true } ),
			),
			$.$div( null,
				$.$label( null, "Steps per beat" ),
				$.$input( { type: "number", min: 1, max: 16, required: true } ),
			),
			$.$div( { class: "gsuiTempo-form-bpm" },
				$.$label( null, "BPM " ),
				$.$div( null,
					$.$input( { type: "number", step: .01, min: 1, max: 999.99, required: true } ),
					$.$button( { icon: "tint", "data-tooltip": GSTX.$tempo_tap } ),
				),
			),
			$.$button( { type: "submit" }, "Ok" ),
		),
	];
} );
