"use strict";

GSUI.$setTemplate( "gsui-effects", () => [
	GSUI.$createElement( "button", { class: "gsuiEffects-addBtn" },
		GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "plus" } ),
	),
	GSUI.$createElement( "select", { class: "gsuiEffects-addSelect", size: 4 },
		GSUI.$createElement( "option", { value: "", disabled: true }, "-- Select an Fx" ),
		GSUI.$createElement( "option", { value: "delay" }, "Delay (echo)" ),
		GSUI.$createElement( "option", { value: "filter" }, "Filter" ),
	),
] );

GSUI.$setTemplate( "gsui-effects-fx", () =>
	GSUI.$createElement( "div", { class: "gsuiEffects-fx", draggable: "true" },
		GSUI.$createElement( "div", { class: "gsuiEffects-fx-head" },
			GSUI.$createElement( "div", { class: "gsuiEffects-fx-grip gsuiIcon", "data-icon": "grip-v" } ),
			GSUI.$createElement( "button", { class: "gsuiEffects-fx-expand gsuiIcon", "data-icon": "caret-right" } ),
			GSUI.$createElement( "button", { class: "gsuiEffects-fx-toggle gsuiIcon", "data-icon": "toggle", title: "Toggle this effect" } ),
			GSUI.$createElement( "span", { class: "gsuiEffects-fx-name" } ),
			GSUI.$createElement( "button", { class: "gsuiEffects-fx-remove gsuiIcon", "data-icon": "close", title: "Delete this effect" } ),
		),
		GSUI.$createElement( "div", { class: "gsuiEffects-fx-content" } ),
	)
);
