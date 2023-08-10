"use strict";

GSUsetTemplate( "gsui-effects", () => [
	GSUcreateElement( "button", { class: "gsuiEffects-addBtn", title: "Add an effect" },
		GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "add-effect" } ),
	),
	GSUcreateElement( "select", { class: "gsuiEffects-addSelect", size: 2 },
		GSUcreateElement( "option", { value: "delay" }, "Delay (echo)" ),
		GSUcreateElement( "option", { value: "filter" }, "Filter" ),
	),
] );

GSUsetTemplate( "gsui-effects-fx", () =>
	GSUcreateElement( "div", { class: "gsuiEffects-fx", draggable: "true" },
		GSUcreateElement( "div", { class: "gsuiEffects-fx-head" },
			GSUcreateElement( "div", { class: "gsuiEffects-fx-grip gsuiIcon", "data-icon": "grip-v" } ),
			GSUcreateElement( "button", { class: "gsuiEffects-fx-expand gsuiIcon", "data-icon": "caret-right" } ),
			GSUcreateElement( "gsui-toggle", { title: "Toggle this effect" } ),
			GSUcreateElement( "span", { class: "gsuiEffects-fx-name" } ),
			GSUcreateElement( "button", { class: "gsuiEffects-fx-remove gsuiIcon", "data-icon": "close", title: "Delete this effect" } ),
		),
		GSUcreateElement( "div", { class: "gsuiEffects-fx-content" } ),
	)
);
