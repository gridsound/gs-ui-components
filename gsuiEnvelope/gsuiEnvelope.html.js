"use strict";

GSUsetTemplate( "gsui-envelope", () =>
	GSUcreateDiv( { class: "gsuiEnvelope-in" },
		GSUcreateDiv( { class: "gsuiEnvelope-props" },
			[
				[ "attack", "attack", "att", 0, 1, .01 ],
				[ "hold", "hold", "hold", 0, 1, .01 ],
				[ "decay", "decay", "dec", 0, 1, .01 ],
				[ "sustain", "sustain", "sus", 0, 1, .01 ],
				[ "release", "release", "rel", 0, 4, .01 ],
				[ "amp", "amplification", "pitch", -24, 24, 1 ],
				[ "q", "Q", "Q", 0, 25, .01 ],
			].map( ( [ prop, title, text, min, max, step ] ) =>
				GSUcreateDiv( { "data-prop": prop, title },
					GSUcreateElement( "gs-label", null, text ),
					GSUcreateElement( "gs-output" ),
					GSUcreateElement( "gsui-slider", { type: "linear-x", disabled: true, min, max, step, "mousemove-size": "800" } ),
				)
			),
		),
		GSUcreateDiv( { class: "gsuiEnvelope-graph", inert: true },
			GSUcreateElement( "gsui-beatlines" ),
			GSUcreateElement( "gsui-envelope-graph" ),
			GSUcreateDiv( { class: "gsuiEnvelope-keyPreviews" } ),
		),
	)
);
