"use strict";

GSUsetTemplate( "gsui-patterns-pattern", () =>
	GSUcreateDiv( { class: "gsuiPatterns-pattern", draggable: "true" },
		GSUcreateDiv( { class: "gsuiPatterns-pattern-grip gsuiIcon", "data-icon": "grip-v" } ),
		GSUcreateDiv( { class: "gsuiPatterns-pattern-head" },
			GSUcreateDiv( { class: "gsuiPatterns-pattern-info" },
				GSUcreateButton( { class: "gsuiPatterns-pattern-btn gsuiPatterns-pattern-btnInfo gsuiIcon", "data-action": "editInfo", "data-icon": "buf-undefined", title: "Edit buffer's info" } ),
				GSUcreateDiv( { class: "gsuiPatterns-pattern-name" } ),
				GSUcreateI( { class: "gsuiPatterns-destArrow gsuiIcon", "data-icon": "arrow-right" } ),
				GSUcreateButton( { class: "gsuiPatterns-btnSolid gsuiPatterns-pattern-dest", "data-action": "redirect", title: "Redirect this pattern" },
					GSUcreateI( { class: "gsuiPatterns-btnIcon gsuiIcon", "data-icon": "mixer" } ),
					GSUcreateSpan( { class: "gsuiPatterns-btnText" } ),
				),
			),
			GSUcreateButton( { class: "gsuiPatterns-pattern-btn gsuiIcon", "data-action": "clone", "data-icon": "clone", title: "Clone this pattern" } ),
			GSUcreateButton( { class: "gsuiPatterns-pattern-btn gsuiIcon", "data-action": "remove", "data-icon": "close", title: "Delete this pattern" } ),
		),
		GSUcreateDiv( { class: "gsuiPatterns-pattern-content" } ),
		GSUcreateDiv( { class: "gsuiPatterns-pattern-placeholder" },
			GSUcreateI( { class: "gsuiPatterns-pattern-placeholderIcon gsuiIcon", "data-icon": "file-corrupt" } ),
			GSUcreateSpan( { class: "gsuiPatterns-pattern-placeholderText" }, "missing data" ),
		),
	)
);
