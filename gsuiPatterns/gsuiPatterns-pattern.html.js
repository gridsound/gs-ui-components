"use strict";

GSUsetTemplate( "gsui-patterns-pattern", () =>
	GSUcreateElement( "div", { class: "gsuiPatterns-pattern", draggable: "true" },
		GSUcreateElement( "div", { class: "gsuiPatterns-pattern-grip gsuiIcon", "data-icon": "grip-v" } ),
		GSUcreateElement( "div", { class: "gsuiPatterns-pattern-head" },
			GSUcreateElement( "div", { class: "gsuiPatterns-pattern-info" },
				GSUcreateElement( "button", { class: "gsuiPatterns-pattern-btn gsuiPatterns-pattern-btnInfo gsuiIcon", "data-action": "editInfo", "data-icon": "buf-undefined", title: "Edit buffer's info" } ),
				GSUcreateElement( "div", { class: "gsuiPatterns-pattern-name" } ),
				GSUcreateElement( "i", { class: "gsuiPatterns-destArrow gsuiIcon", "data-icon": "arrow-right" } ),
				GSUcreateElement( "button", { class: "gsuiPatterns-btnSolid gsuiPatterns-pattern-dest", "data-action": "redirect", title: "Redirect this pattern" },
					GSUcreateElement( "i", { class: "gsuiPatterns-btnIcon gsuiIcon", "data-icon": "mixer" } ),
					GSUcreateElement( "span", { class: "gsuiPatterns-btnText" } ),
				),
			),
			GSUcreateElement( "button", { class: "gsuiPatterns-pattern-btn gsuiIcon", "data-action": "clone", "data-icon": "clone", title: "Clone this pattern" } ),
			GSUcreateElement( "button", { class: "gsuiPatterns-pattern-btn gsuiIcon", "data-action": "remove", "data-icon": "close", title: "Delete this pattern" } ),
		),
		GSUcreateElement( "div", { class: "gsuiPatterns-pattern-content" } ),
		GSUcreateElement( "div", { class: "gsuiPatterns-pattern-placeholder" },
			GSUcreateElement( "i", { class: "gsuiPatterns-pattern-placeholderIcon gsuiIcon", "data-icon": "file-corrupt" } ),
			GSUcreateElement( "span", { class: "gsuiPatterns-pattern-placeholderText" }, "missing data" ),
		),
	)
);
