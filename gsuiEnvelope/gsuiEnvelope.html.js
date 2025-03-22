"use strict";

GSUsetTemplate( "gsui-envelope", () => [
	[
		[ "attack", "attack", "att", 0, 1, .01 ],
		[ "hold", "hold", "hold", 0, 1, .01 ],
		[ "decay", "decay", "dec", 0, 1, .01 ],
		[ "sustain", "sustain", "sus", 0, 1, .01 ],
		[ "release", "release", "rel", 0, 4, .01 ],
		[ "amp", "amplification", "pitch", -24, 24, 1 ],
		[ "q", "Q", "Q", 0, 25, .01 ],
	].map( ( [ prop, title, text, min, max, step ] ) =>
		GSUcreateDiv( { class: "gsuiEnvelope-prop", title, "data-prop": prop },
			GSUcreateDiv( { class: "gsuiEnvelope-propLabel" },
				GSUcreateSpan( null, text ),
				GSUcreateSpan( { class: "gsuiEnvelope-propValue" } ),
			),
			GSUcreateDiv( { class: "gsuiEnvelope-propContent" },
				GSUcreateElement( "gsui-slider", { type: "linear-x", disabled: true, min, max, step, "mousemove-size": "800", "data-prop": prop } ),
			),
		)
	),
	GSUcreateDiv( { class: "gsuiEnvelope-graph" },
		GSUcreateElement( "gsui-beatlines", { coloredbeats: "" } ),
		GSUcreateElement( "gsui-envelope-graph" ),
	),
].flat( 1 ) );
