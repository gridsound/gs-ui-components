"use strict";

GSUsetTemplate( "gsui-lfo", () => {
	return [
		GSUcreateElement( "div", { class: "gsuiLFO-graph" },
			GSUcreateElement( "div", { class: "gsuiLFO-wave" },
				GSUcreateElement( "gsui-beatlines", { coloredbeats: "" } ),
				GSUcreateElement( "gsui-periodicwave" ),
			),
			GSUcreateElement( "div", { class: "gsuiLFO-ampSigns" },
				GSUcreateElement( "label", { class: "gsuiLFO-btn gsuiLFO-ampSign" },
					GSUcreateElement( "input", { class: "gsuiLFO-btnInput gsuiLFO-ampSignRadio", name: "gsuiLFO-ampSign", type: "radio", value: "1" } ),
					GSUcreateElement( "i", { class: "gsuiLFO-btnIcon gsuiLFO-ampSignIcon gsuiIcon", "data-icon": "caret-up" } ),
				),
				GSUcreateElement( "label", { class: "gsuiLFO-btn gsuiLFO-ampSign" },
					GSUcreateElement( "input", { class: "gsuiLFO-btnInput gsuiLFO-ampSignRadio", name: "gsuiLFO-ampSign", type: "radio", value: "-1" } ),
					GSUcreateElement( "i", { class: "gsuiLFO-btnIcon gsuiLFO-ampSignIcon gsuiIcon", "data-icon": "caret-down" } ),
				),
			),
		),
		[
			[ "delay", "delay", "del", 0, 4, .03125 ],
			[ "attack", "attack", "att", 0, 4, .03125 ],
			[ "speed", "speed", "spd", .25, 18, .125 ],
			[ "amp", "amplitude", "amp", .001, 1, .001 ],
		].map( ( [ prop, title, text, min, max, step ] ) =>
			GSUcreateElement( "div", { class: `gsuiLFO-prop gsuiLFO-${ prop }`, title },
				GSUcreateElement( "div", { class: "gsuiLFO-propLabel" },
					GSUcreateElement( "span", null, text ),
					GSUcreateElement( "div", { class: "gsuiLFO-propValue" } ),
				),
				GSUcreateElement( "div", { class: "gsuiLFO-propContent" },
					GSUcreateElement( "gsui-slider", { type: "linear-x", disabled: true, min, max, step, "mousemove-size": "800", "data-prop": prop } ),
				),
			)
		),
		GSUcreateElement( "div", { class: "gsuiLFO-prop gsuiLFO-type" },
			GSUcreateElement( "div", { class: "gsuiLFO-propLabel" }, "wave" ),
			GSUcreateElement( "div", { class: "gsuiLFO-propContent" },
				[
					[ "sine", "M 1 5 C 1 4 1 1 4 1 C 7 1 7 4 7 5 C 7 6 7 9 10 9 C 13 9 13 6 13 5" ],
					[ "triangle", "M 1 5 L 4 1 L 10 9 L 13 5" ],
					[ "sawtooth", "M 1 5 L 7 1 L 7 9 L 13 5" ],
					[ "square", "M 1 5 L 1 1 L 7 1 L 7 9 L 13 9 L 13 5" ],
				].map( ( [ w, dots ] ) =>
					GSUcreateElement( "label", { class: "gsuiLFO-btn gsuiLFO-typeBtn", title: w },
						GSUcreateElement( "input", { class: "gsuiLFO-btnInput gsuiLFO-typeRadio", name: "gsuiLFO-type", type: "radio", value: w } ),
						GSUcreateElementSVG( "svg", { class: "gsuiLFO-btnIcon gsuiLFO-typeSVG", viewBox: "0 0 14 10" }, GSUcreateElementSVG( "path", { d: dots } ) ),
					)
				)
			),
		),
	].flat( 1 );
} );
