"use strict";

GSUI.setTemplate( "gsui-envelope", () => {
	return [
		GSUI.createElem( "div", { class: "gsuiEnvelope-head" },
			GSUI.createElem( "label", { class: "gsuiEnvelope-toggle", title: "Toggle envelope" },
				GSUI.createElem( "input", { class: "gsuiEnvelope-toggleCheckbox", name: "gsuiEnvelope-toggle", type: "checkbox" } ),
				GSUI.createElem( "i", { class: "gsuiEnvelope-toggleIcon gsuiIcon", "data-icon": "toggle" } ),
			),
			GSUI.createElem( "span", { class: "gsuiEnvelope-title" }, "env gain" ),
		),
		[
			[ "attack", "attack", "att", 0, 1, .01 ],
			[ "hold", "hold", "hold", 0, 1, .01 ],
			[ "decay", "decay", "dec", 0, 1, .01 ],
			[ "sustain", "sustain", "sus", 0, 1, .01 ],
			[ "release", "release", "rel", 0, 4, .01 ],
		].map( ( [ prop, title, text, min, max, step ] ) =>
			GSUI.createElem( "div", { class: `gsuiEnvelope-prop gsuiEnvelope-${ prop }`, title },
				GSUI.createElem( "div", { class: "gsuiEnvelope-propLabel" },
					GSUI.createElem( "span", null, text ),
					GSUI.createElem( "div", { class: "gsuiEnvelope-propValue" } ),
				),
				GSUI.createElem( "div", { class: "gsuiEnvelope-propContent" },
					GSUI.createElem( "gsui-slider", { type: "linear-x", min, max, step, "mousemove-size": "800", "data-prop": prop } ),
				),
			)
		),
		GSUI.createElem( "div", { class: "gsuiEnvelope-graph" },
			GSUI.createElem( "gsui-beatlines", { coloredbeats: "" } ),
			GSUI.createElem( "gsui-envelope-graph" ),
		),
	].flat( 1 );
} );
