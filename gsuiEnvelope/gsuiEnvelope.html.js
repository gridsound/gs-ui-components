"use strict";

$.$setTemplate( "gsui-envelope", () =>
	$.$div( { class: "gsuiEnvelope-in" },
		$.$div( { class: "gsuiEnvelope-props" },
			[
				[ "attack", "attack", "att", 0, 1, .01 ],
				[ "hold", "hold", "hold", 0, 1, .01 ],
				[ "decay", "decay", "dec", 0, 1, .01 ],
				[ "sustain", "sustain", "sus", 0, 1, .01 ],
				[ "release", "release", "rel", 0, 4, .01 ],
				[ "amp", "amplification", "pitch", -24, 24, 1 ],
				[ "q", "Q", "Q", 0, 25, .01 ],
			].map( ( [ prop, title, text, min, max, step ] ) =>
				$.$div( { "data-prop": prop, title },
					$.$elem( "gs-label", null, text ),
					$.$elem( "gs-output" ),
					$.$elem( "gsui-slider", { type: "linear-x", disabled: true, min, max, step, "mousemove-size": "800" } ),
				)
			),
		),
		$.$div( { class: "gsuiEnvelope-graph", inert: true },
			$.$elem( "gsui-beatlines" ),
			$.$elem( "gsui-envelope-graph" ),
			$.$div( { class: "gsuiEnvelope-keyPreviews" } ),
		),
	)
);
