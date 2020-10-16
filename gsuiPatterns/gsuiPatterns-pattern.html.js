"use strict";

GSUI.setTemplate( "gsui-patterns-pattern", () => (
	GSUI.createElement( "div", { class: "gsuiPatterns-pattern", draggable: "true" },
		GSUI.createElement( "div", { class: "gsuiPatterns-pattern-grip gsuiIcon", "data-icon": "grip-v" } ),
		GSUI.createElement( "div", { class: "gsuiPatterns-pattern-head" },
			GSUI.createElement( "div", { class: "gsuiPatterns-pattern-info" },
				GSUI.createElement( "div", { class: "gsuiPatterns-pattern-name" } ),
				GSUI.createElement( "i", { class: "gsuiPatterns-destArrow gsuiIcon", "data-icon": "arrow-right" } ),
				GSUI.createElement( "button", { class: "gsuiPatterns-btnSolid gsuiPatterns-pattern-dest", "data-action": "redirect", title: "Redirect this pattern" },
					GSUI.createElement( "i", { class: "gsuiPatterns-btnIcon gsuiIcon", "data-icon": "mixer" } ),
					GSUI.createElement( "span", { class: "gsuiPatterns-btnText" } ),
				),
			),
			GSUI.createElement( "button", { class: "gsuiPatterns-pattern-btn gsuiIcon", "data-action": "clone", "data-icon": "clone", title: "Clone this pattern" } ),
			GSUI.createElement( "button", { class: "gsuiPatterns-pattern-btn gsuiIcon", "data-action": "remove", "data-icon": "close", title: "Delete this pattern" } ),
		),
		GSUI.createElement( "div", { class: "gsuiPatterns-pattern-content" } ),
		GSUI.createElement( "div", { class: "gsuiPatterns-pattern-placeholder" },
			GSUI.createElement( "i", { class: "gsuiPatterns-pattern-placeholderIcon gsuiIcon", "data-icon": "file-corrupt" } ),
			GSUI.createElement( "span", { class: "gsuiPatterns-pattern-placeholderText" }, "missing data" ),
		),
	)
) );
