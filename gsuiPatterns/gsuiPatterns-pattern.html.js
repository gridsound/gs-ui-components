"use strict";

GSUI.setTemplate( "gsui-patterns-pattern", () =>
	GSUI.createElem( "div", { class: "gsuiPatterns-pattern", draggable: "true" },
		GSUI.createElem( "div", { class: "gsuiPatterns-pattern-grip gsuiIcon", "data-icon": "grip-v" } ),
		GSUI.createElem( "div", { class: "gsuiPatterns-pattern-head" },
			GSUI.createElem( "div", { class: "gsuiPatterns-pattern-info" },
				GSUI.createElem( "button", { class: "gsuiPatterns-pattern-btn gsuiPatterns-pattern-btnInfo gsuiIcon", "data-action": "editInfo", "data-icon": "buf-undefined", title: "Edit buffer's info" } ),
				GSUI.createElem( "div", { class: "gsuiPatterns-pattern-name" } ),
				GSUI.createElem( "i", { class: "gsuiPatterns-destArrow gsuiIcon", "data-icon": "arrow-right" } ),
				GSUI.createElem( "button", { class: "gsuiPatterns-btnSolid gsuiPatterns-pattern-dest", "data-action": "redirect", title: "Redirect this pattern" },
					GSUI.createElem( "i", { class: "gsuiPatterns-btnIcon gsuiIcon", "data-icon": "mixer" } ),
					GSUI.createElem( "span", { class: "gsuiPatterns-btnText" } ),
				),
			),
			GSUI.createElem( "button", { class: "gsuiPatterns-pattern-btn gsuiIcon", "data-action": "clone", "data-icon": "clone", title: "Clone this pattern" } ),
			GSUI.createElem( "button", { class: "gsuiPatterns-pattern-btn gsuiIcon", "data-action": "remove", "data-icon": "close", title: "Delete this pattern" } ),
		),
		GSUI.createElem( "div", { class: "gsuiPatterns-pattern-content" } ),
		GSUI.createElem( "div", { class: "gsuiPatterns-pattern-placeholder" },
			GSUI.createElem( "i", { class: "gsuiPatterns-pattern-placeholderIcon gsuiIcon", "data-icon": "file-corrupt" } ),
			GSUI.createElem( "span", { class: "gsuiPatterns-pattern-placeholderText" }, "missing data" ),
		),
	)
);
