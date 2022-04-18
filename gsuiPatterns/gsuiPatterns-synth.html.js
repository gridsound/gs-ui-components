"use strict";

GSUI.setTemplate( "gsui-patterns-synth", () =>
	GSUI.createElem( "div", { class: "gsuiPatterns-synth" },
		GSUI.createElem( "div", { class: "gsuiPatterns-synth-head" },
			GSUI.createElem( "button", { class: "gsuiPatterns-synth-btn gsuiPatterns-synth-expand gsuiIcon", "data-action": "expand", "data-icon": "caret-right" } ),
			GSUI.createElem( "div", { class: "gsuiPatterns-synth-info" },
				GSUI.createElem( "div", { class: "gsuiPatterns-synth-name" } ),
				GSUI.createElem( "i", { class: "gsuiPatterns-destArrow gsuiIcon", "data-icon": "arrow-right" } ),
				GSUI.createElem( "button", { class: "gsuiPatterns-btnSolid gsuiPatterns-synth-dest", "data-action": "redirect", title: "Redirect this synthesizer" },
					GSUI.createElem( "i", { class: "gsuiPatterns-btnIcon gsuiIcon", "data-icon": "mixer" } ),
					GSUI.createElem( "span", { class: "gsuiPatterns-btnText" } ),
				),
			),
			GSUI.createElem( "button", { class: "gsuiPatterns-synth-btn gsuiIcon", "data-action": "newPattern", "data-icon": "plus", title: "Create a new pattern with this synthesizer" } ),
			GSUI.createElem( "button", { class: "gsuiPatterns-synth-btn gsuiIcon", "data-action": "delete", "data-icon": "close", title: "Delete the synthesizer and its patterns" } ),
		),
		GSUI.createElem( "div", { class: "gsuiPatterns-placeholderToCheck gsuiPatterns-synth-patterns" },
			GSUI.createElem( "div", { class: "gsuiPatterns-placeholder" },
				GSUI.createElem( "span", null, "this synthesizer has no related pattern" ),
			),
		),
	)
);
