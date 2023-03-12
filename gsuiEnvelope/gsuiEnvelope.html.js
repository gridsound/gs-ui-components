"use strict";

GSUI.$setTemplate( "gsui-envelope", () => {
	return [
		[
			[ "attack", "attack", "att", 0, 1, .01 ],
			[ "hold", "hold", "hold", 0, 1, .01 ],
			[ "decay", "decay", "dec", 0, 1, .01 ],
			[ "sustain", "sustain", "sus", 0, 1, .01 ],
			[ "release", "release", "rel", 0, 4, .01 ],
		].map( ( [ prop, title, text, min, max, step ] ) =>
			GSUI.$createElement( "div", { class: `gsuiEnvelope-prop gsuiEnvelope-${ prop }`, title },
				GSUI.$createElement( "div", { class: "gsuiEnvelope-propLabel" },
					GSUI.$createElement( "span", null, text ),
					GSUI.$createElement( "div", { class: "gsuiEnvelope-propValue" } ),
				),
				GSUI.$createElement( "div", { class: "gsuiEnvelope-propContent" },
					GSUI.$createElement( "gsui-slider", { type: "linear-x", disabled: true, min, max, step, "mousemove-size": "800", "data-prop": prop } ),
				),
			)
		),
		GSUI.$createElement( "div", { class: "gsuiEnvelope-graph" },
			GSUI.$createElement( "gsui-beatlines", { coloredbeats: "" } ),
			GSUI.$createElement( "gsui-envelope-graph" ),
		),
	].flat( 1 );
} );
