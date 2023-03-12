"use strict";

GSUI.$setTemplate( "gsui-effects", () => [
	GSUI.$createElement( "button", { class: "gsuiEffects-addBtn", title: "Add an effect" },
		GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "add-effect" } ),
	),
	GSUI.$createElement( "select", { class: "gsuiEffects-addSelect", size: 2 },
		GSUI.$createElement( "option", { value: "delay" }, "Delay (echo)" ),
		GSUI.$createElement( "option", { value: "filter" }, "Filter" ),
	),
] );

GSUI.$setTemplate( "gsui-effects-fx", () =>
	GSUI.$createElement( "div", { class: "gsuiEffects-fx", draggable: "true" },
		GSUI.$createElement( "div", { class: "gsuiEffects-fx-head" },
			GSUI.$createElement( "div", { class: "gsuiEffects-fx-grip gsuiIcon", "data-icon": "grip-v" } ),
			GSUI.$createElement( "button", { class: "gsuiEffects-fx-expand gsuiIcon", "data-icon": "caret-right" } ),
			GSUI.$createElement( "gsui-toggle", { title: "Toggle this effect" } ),
			GSUI.$createElement( "span", { class: "gsuiEffects-fx-name" } ),
			GSUI.$createElement( "button", { class: "gsuiEffects-fx-remove gsuiIcon", "data-icon": "close", title: "Delete this effect" } ),
		),
		GSUI.$createElement( "div", { class: "gsuiEffects-fx-content" } ),
	)
);
