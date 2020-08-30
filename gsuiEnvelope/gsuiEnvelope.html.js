"use strict";

GSUI.setTemplate( "gsui-envelope", () => {
	return [
		GSUI.createElement( "div", { class: "gsuiEnvelope-head" },
			GSUI.createElement( "label", { class: "gsuiEnvelope-toggle", title: "Toggle envelope" },
				GSUI.createElement( "input", { class: "gsuiEnvelope-toggleCheckbox", name: "gsuiEnvelope-toggle", type: "checkbox" } ),
				GSUI.createElement( "i", { class: "gsuiEnvelope-toggleIcon gsuiIcon", "data-icon": "toggle" } ),
			),
			GSUI.createElement( "span", { class: "gsuiEnvelope-title" }, "Env" ),
		),
		[
			[ "attack", "attack", "att", 0, 1, .01 ],
			[ "hold", "hold", "hold", 0, 1, .01 ],
			[ "decay", "decay", "dec", 0, 1, .01 ],
			[ "substain", "substain", "sub", 0, 1, .01 ],
			[ "release", "release", "rel", 0, 4, .01 ],
		].map( ( [ clazz, title, text, min, max, step ] ) => (
			GSUI.createElement( "div", { class: `gsuiEnvelope-prop gsuiEnvelope-${ clazz }`, title },
				GSUI.createElement( "div", { class: "gsuiEnvelope-propLabel" },
					GSUI.createElement( "span", null, text ),
					GSUI.createElement( "div", { class: "gsuiEnvelope-propValue" } ),
				),
				GSUI.createElement( "div", { class: "gsuiEnvelope-propContent" },
					GSUI.createElement( "gsui-slider", { type: "linear-x", min, max, step, "mousemove-size": "800" } ),
				),
			)
		) ),
		GSUI.createElement( "div", { class: "gsuiEnvelope-graph" },
			GSUI.createElement( "gsui-beatlines", { coloredbeats: "" } ),
		),
	].flat( 1 );
} );
