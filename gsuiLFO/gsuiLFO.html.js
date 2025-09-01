"use strict";

GSUsetTemplate( "gsui-lfo", () =>
	GSUcreateDiv( { class: "gsuiLFO-in" },
		GSUcreateDiv( { class: "gsuiLFO-props" },
			[
				[ "delay", "delay", "del", 0, 4, .03125 ],
				[ "attack", "attack", "att", 0, 4, .03125 ],
				[ "speed", "speed", "spd", .25, 18, .125 ],
				[ "amp", "amplitude", "amp", .001, 1, .001 ],
			].map( ( [ prop, title, text, min, max, step ] ) =>
				GSUcreateDiv( { class: "gsuiLFO-prop", title, "data-prop": prop },
					GSUcreateSpan( { class: "gsuiLFO-propLabel" }, text ),
					GSUcreateSpan( { class: "gsuiLFO-propValue" } ),
					GSUcreateElement( "gsui-slider", { type: "linear-x", disabled: true, min, max, step, "mousemove-size": "800", "data-prop": prop } ),
				)
			),
		),
		GSUcreateDiv( { class: "gsuiLFO-type" },
			[
				[ "sine", "M 1 5 C 1 4 1 1 4 1 C 7 1 7 4 7 5 C 7 6 7 9 10 9 C 13 9 13 6 13 5" ],
				[ "triangle", "M 1 5 L 4 1 L 10 9 L 13 5" ],
				[ "sawtooth", "M 1 5 L 7 1 L 7 9 L 13 5" ],
				[ "square", "M 1 5 L 1 1 L 7 1 L 7 9 L 13 9 L 13 5" ],
			].map( ( [ w, dots ] ) =>
				GSUcreateLabel( { class: "gsuiLFO-btn gsuiLFO-typeBtn", title: w },
					GSUcreateInput( { class: "gsuiLFO-btnInput gsuiLFO-typeRadio", name: "gsuiLFO-type", type: "radio", value: w } ),
					GSUcreateElement( "svg", { class: "gsuiLFO-btnIcon gsuiLFO-typeSVG", viewBox: "0 0 14 10" }, GSUcreateElement( "path", { d: dots } ) ),
				)
			),
		),
		GSUcreateDiv( { class: "gsuiLFO-graph" },
			GSUcreateDiv( { class: "gsuiLFO-wave" },
				GSUcreateElement( "gsui-beatlines", { coloredbeats: "" } ),
				GSUcreateElement( "gsui-periodicwave" ),
				GSUcreateDiv( { class: "gsuiLFO-keyPreviews" } ),
			),
			GSUcreateDiv( { class: "gsuiLFO-ampSigns" },
				GSUcreateLabel( { class: "gsuiLFO-btn gsuiLFO-ampSign" },
					GSUcreateInput( { class: "gsuiLFO-btnInput gsuiLFO-ampSignRadio", name: "gsuiLFO-ampSign", type: "radio", value: "1" } ),
					GSUcreateIcon( { class: "gsuiLFO-btnIcon gsuiLFO-ampSignIcon", icon: "caret-up" } ),
				),
				GSUcreateLabel( { class: "gsuiLFO-btn gsuiLFO-ampSign" },
					GSUcreateInput( { class: "gsuiLFO-btnInput gsuiLFO-ampSignRadio", name: "gsuiLFO-ampSign", type: "radio", value: "-1" } ),
					GSUcreateIcon( { class: "gsuiLFO-btnIcon gsuiLFO-ampSignIcon", icon: "caret-down" } ),
				),
			),
		),
	)
);
