"use strict";

$.$setTemplate( "gsui-lfo", () =>
	$.$div( { class: "gsuiLFO-in" },
		$.$div( { class: "gsuiLFO-props" },
			[
				[ "delay", "delay", "del", 0, 4, .03125 ],
				[ "attack", "attack", "att", 0, 4, .03125 ],
				[ "speed", "speed", "spd", .25, 18, .125 ],
				[ "amp", "amplitude", "amp", .001, 1, .001 ],
			].map( ( [ prop, title, text, min, max, step ] ) =>
				$.$div( { "data-prop": prop, title },
					$.$elem( "gs-label", null, text ),
					$.$elem( "gs-output" ),
					$.$elem( "gsui-slider", { type: "linear-x", disabled: true, min, max, step, "mousemove-size": "800" } ),
				)
			),
		),
		$.$div( { class: "gsuiLFO-type" },
			[
				[ "sine", "M 1 5 C 1 4 1 1 4 1 C 7 1 7 4 7 5 C 7 6 7 9 10 9 C 13 9 13 6 13 5" ],
				[ "triangle", "M 1 5 L 4 1 L 10 9 L 13 5" ],
				[ "sawtooth", "M 1 5 L 7 1 L 7 9 L 13 5" ],
				[ "square", "M 1 5 L 1 1 L 7 1 L 7 9 L 13 9 L 13 5" ],
			].map( ( [ w, dots ] ) =>
				$.$label( { title: w },
					$.$input( { name: "gsuiLFO-type", type: "radio", value: w } ),
					$.$elem( "svg", { viewBox: "0 0 14 10", inert: true },
						$.$elem( "path", { d: dots } ),
					),
				)
			),
		),
		$.$div( { class: "gsuiLFO-graph" },
			$.$div( { class: "gsuiLFO-wave", inert: true },
				$.$elem( "gsui-beatlines" ),
				$.$elem( "gsui-periodicwave" ),
				$.$div( { class: "gsuiLFO-keyPreviews" } ),
			),
			$.$div( { class: "gsuiLFO-ampSigns" },
				$.$label( null,
					$.$input( { name: "gsuiLFO-ampSign", type: "radio", value: "1" } ),
					$.$icon( { icon: "caret-up" } ),
				),
				$.$label( null,
					$.$input( { name: "gsuiLFO-ampSign", type: "radio", value: "-1" } ),
					$.$icon( { icon: "caret-down" } ),
				),
			),
		),
	)
);
