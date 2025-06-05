"use strict";

GSUsetTemplate( "gsui-patterns-synth", () =>
	GSUcreateDiv( { class: "gsuiPatterns-synth" },
		GSUcreateDiv( { class: "gsuiPatterns-synth-head" },
			GSUcreateButton( { class: "gsuiPatterns-synth-btn gsuiPatterns-synth-expand gsuiIcon", "data-action": "expand", "data-icon": "caret-right" } ),
			GSUcreateDiv( { class: "gsuiPatterns-synth-info" },
				GSUcreateDiv( { class: "gsuiPatterns-synth-name" } ),
				GSUcreateButton( { class: "gsuiPatterns-btnSolid gsuiPatterns-synth-dest", "data-action": "redirect", title: "Redirect this synthesizer" },
					GSUcreateIcon( { class: "gsuiPatterns-btnIcon", icon: "mixer" } ),
					GSUcreateSpan( { class: "gsuiPatterns-btnText" } ),
				),
			),
			GSUcreateButton( { class: "gsuiPatterns-synth-btn gsuiIcon", "data-action": "newPattern", "data-icon": "plus", title: "Create a new pattern with this synthesizer" } ),
			GSUcreateButton( { class: "gsuiPatterns-synth-btn gsuiIcon", "data-action": "delete", "data-icon": "close", title: "Delete the synthesizer and its patterns" } ),
		),
		GSUcreateDiv( { class: "gsuiPatterns-placeholderToCheck gsuiPatterns-synth-patterns" },
			GSUcreateDiv( { class: "gsuiPatterns-placeholder", inert: true },
				GSUcreateSpan( null, "this synthesizer has no related pattern" ),
			),
		),
	)
);
