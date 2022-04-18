"use strict";

GSUI.setTemplate( "gsui-effects", () =>
	GSUI.createElem( "div", { class: "gsuiEffects-list" },
		GSUI.createElem( "button", { class: "gsuiEffects-addBtn" },
			GSUI.createElem( "i", { class: "gsuiIcon", "data-icon": "plus" } ),
		),
		GSUI.createElem( "select", { class: "gsuiEffects-addSelect", size: 4 } ),
	)
);

GSUI.setTemplate( "gsui-effects-fx", () =>
	GSUI.createElem( "div", { class: "gsuiEffects-fx", draggable: "true" },
		GSUI.createElem( "div", { class: "gsuiEffects-fx-head" },
			GSUI.createElem( "div", { class: "gsuiEffects-fx-grip gsuiIcon", "data-icon": "grip-v" } ),
			GSUI.createElem( "button", { class: "gsuiEffects-fx-expand gsuiIcon", "data-icon": "caret-right" } ),
			GSUI.createElem( "button", { class: "gsuiEffects-fx-toggle gsuiIcon", "data-icon": "toggle", title: "Toggle this effect" } ),
			GSUI.createElem( "span", { class: "gsuiEffects-fx-name" } ),
			GSUI.createElem( "button", { class: "gsuiEffects-fx-remove gsuiIcon", "data-icon": "close", title: "Delete this effect" } ),
		),
		GSUI.createElem( "div", { class: "gsuiEffects-fx-content" } ),
	)
);
