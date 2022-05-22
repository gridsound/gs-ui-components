"use strict";

GSUI.setTemplate( "gsui-lfo", () => {
	return [
		GSUI.createElem( "div", { class: "gsuiLFO-head" },
			GSUI.createElem( "label", { class: "gsuiLFO-btn gsuiLFO-toggle", title: "Toggle LFO" },
				GSUI.createElem( "input", { class: "gsuiLFO-btnInput gsuiLFO-toggleCheckbox", name: "gsuiLFO-toggle", type: "checkbox" } ),
				GSUI.createElem( "i", { class: "gsuiLFO-btnIcon gsuiLFO-toggleIcon gsuiIcon", "data-icon": "toggle" } ),
			),
			GSUI.createElem( "span", { class: "gsuiLFO-title" }, "LFO" ),
		),
		GSUI.createElem( "div", { class: "gsuiLFO-graph" },
			GSUI.createElem( "div", { class: "gsuiLFO-wave" },
				GSUI.createElem( "gsui-beatlines", { coloredbeats: "" } ),
				GSUI.createElem( "gsui-periodicwave" ),
			),
			GSUI.createElem( "div", { class: "gsuiLFO-ampSigns" },
				GSUI.createElem( "label", { class: "gsuiLFO-btn gsuiLFO-ampSign" },
					GSUI.createElem( "input", { class: "gsuiLFO-btnInput gsuiLFO-ampSignRadio", name: "gsuiLFO-ampSign", type: "radio", value: "1" } ),
					GSUI.createElem( "i", { class: "gsuiLFO-btnIcon gsuiLFO-ampSignIcon gsuiIcon", "data-icon": "caret-up" } ),
				),
				GSUI.createElem( "label", { class: "gsuiLFO-btn gsuiLFO-ampSign" },
					GSUI.createElem( "input", { class: "gsuiLFO-btnInput gsuiLFO-ampSignRadio", name: "gsuiLFO-ampSign", type: "radio", value: "-1" } ),
					GSUI.createElem( "i", { class: "gsuiLFO-btnIcon gsuiLFO-ampSignIcon gsuiIcon", "data-icon": "caret-down" } ),
				),
			),
		),
		[
			[ "delay", "delay", "del", 0, 4, .03125 ],
			[ "attack", "attack", "att", 0, 4, .03125 ],
			[ "speed", "speed", "spd", .25, 18, .125 ],
			[ "amp", "amplitude", "amp", .001, 1, .001 ],
		].map( props => GSUI.getTemplate( "gsui-lfo-slider", props ) ),
		GSUI.createElem( "div", { class: "gsuiLFO-prop gsuiLFO-type" },
			GSUI.createElem( "div", { class: "gsuiLFO-propLabel" }, "wave" ),
			GSUI.createElem( "div", { class: "gsuiLFO-propContent" },
				[
					[ "sine", "M 1 5 C 1 4 1 1 4 1 C 7 1 7 4 7 5 C 7 6 7 9 10 9 C 13 9 13 6 13 5" ],
					[ "triangle", "M 1 5 L 4 1 L 10 9 L 13 5" ],
					[ "sawtooth", "M 1 5 L 7 1 L 7 9 L 13 5" ],
					[ "square", "M 1 5 L 1 1 L 7 1 L 7 9 L 13 9 L 13 5" ],
				].map( ( [ w, dots ] ) =>
					GSUI.createElem( "label", { class: "gsuiLFO-btn gsuiLFO-typeBtn", title: w },
						GSUI.createElem( "input", { class: "gsuiLFO-btnInput gsuiLFO-typeRadio", name: "gsuiLFO-type", type: "radio", value: w } ),
						GSUI.createElemSVG( "svg", { class: "gsuiLFO-btnIcon gsuiLFO-typeSVG", viewBox: "0 0 14 10" }, GSUI.createElemSVG( "path", { d: dots } ) ),
					)
				)
			),
		),
	].flat( 1 );
} );

GSUI.setTemplate( "gsui-lfo-slider", ( [ prop, title, text, min, max, step ] ) => (
	GSUI.createElem( "div", { class: `gsuiLFO-prop gsuiLFO-${ prop }`, title },
		GSUI.createElem( "div", { class: "gsuiLFO-propLabel" },
			GSUI.createElem( "span", null, text ),
			GSUI.createElem( "div", { class: "gsuiLFO-propValue" } ),
		),
		GSUI.createElem( "div", { class: "gsuiLFO-propContent" },
			GSUI.createElem( "gsui-slider", { type: "linear-x", min, max, step, "mousemove-size": "800", "data-prop": prop } ),
		),
	)
) );
