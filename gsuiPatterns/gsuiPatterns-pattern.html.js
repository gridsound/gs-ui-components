"use strict";

GSUsetTemplate( "gsui-patterns-pattern", () =>
	GSUcreateDiv( { class: "gsuiPatterns-pattern" },
		GSUcreateDiv( { class: "gsuiPatterns-pattern-grip gsuiIcon", "data-icon": "grip-v" } ),
		GSUcreateDiv( { class: "gsuiPatterns-pattern-head" },
			GSUcreateDiv( { class: "gsuiPatterns-pattern-info" },
				GSUcreateButton( { class: "gsuiPatterns-pattern-btn gsuiPatterns-pattern-btnInfo", "data-action": "editInfo", icon: "buf-undefined", title: "Edit buffer's info" } ),
				GSUcreateDiv( { class: "gsuiPatterns-pattern-name" } ),
				GSUcreateButton( { class: "gsuiPatterns-btnSolid gsuiPatterns-pattern-dest", "data-action": "redirect", title: "Redirect this pattern" },
					GSUcreateIcon( { class: "gsuiPatterns-btnIcon", icon: "mixer" } ),
					GSUcreateSpan( { class: "gsuiPatterns-btnText" } ),
				),
			),
			GSUcreateButton( { class: "gsuiPatterns-pattern-btn", "data-action": "clone",  icon: "clone", title: "Clone this pattern" } ),
			GSUcreateButton( { class: "gsuiPatterns-pattern-btn", "data-action": "remove", icon: "close", title: "Delete this pattern" } ),
		),
		GSUcreateDiv( { class: "gsuiPatterns-pattern-content" } ),
		GSUcreateDiv( { class: "gsuiPatterns-pattern-placeholder" },
			GSUcreateIcon( { class: "gsuiPatterns-pattern-placeholderIcon", icon: "file-corrupt" } ),
			GSUcreateSpan( { class: "gsuiPatterns-pattern-placeholderText" }, "missing data" ),
		),
	)
);
