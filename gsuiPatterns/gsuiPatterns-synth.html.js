"use strict";

GSUsetTemplate( "gsui-patterns-synth", () =>
	GSUcreateElement( "div", { class: "gsuiPatterns-synth" },
		GSUcreateElement( "div", { class: "gsuiPatterns-synth-head" },
			GSUcreateButton( { class: "gsuiPatterns-synth-btn gsuiPatterns-synth-expand gsuiIcon", "data-action": "expand", "data-icon": "caret-right" } ),
			GSUcreateElement( "div", { class: "gsuiPatterns-synth-info" },
				GSUcreateElement( "div", { class: "gsuiPatterns-synth-name" } ),
				GSUcreateElement( "i", { class: "gsuiPatterns-destArrow gsuiIcon", "data-icon": "arrow-right" } ),
				GSUcreateButton( { class: "gsuiPatterns-btnSolid gsuiPatterns-synth-dest", "data-action": "redirect", title: "Redirect this synthesizer" },
					GSUcreateElement( "i", { class: "gsuiPatterns-btnIcon gsuiIcon", "data-icon": "mixer" } ),
					GSUcreateElement( "span", { class: "gsuiPatterns-btnText" } ),
				),
			),
			GSUcreateButton( { class: "gsuiPatterns-synth-btn gsuiIcon", "data-action": "newPattern", "data-icon": "plus", title: "Create a new pattern with this synthesizer" } ),
			GSUcreateButton( { class: "gsuiPatterns-synth-btn gsuiIcon", "data-action": "delete", "data-icon": "close", title: "Delete the synthesizer and its patterns" } ),
		),
		GSUcreateElement( "div", { class: "gsuiPatterns-placeholderToCheck gsuiPatterns-synth-patterns" },
			GSUcreateElement( "div", { class: "gsuiPatterns-placeholder", inert: true },
				GSUcreateElement( "span", null, "this synthesizer has no related pattern" ),
			),
		),
	)
);
