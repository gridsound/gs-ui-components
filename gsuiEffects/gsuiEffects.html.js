"use strict";

GSUsetTemplate( "gsui-effects", () => [
	GSUcreateButton( { class: "gsuiEffects-addBtn", title: "Add an effect" },
		GSUcreateI( { class: "gsuiIcon", "data-icon": "add-effect" } ),
	),
	GSUcreateSelect( { class: "gsuiEffects-addSelect", size: 2 },
		GSUcreateOption( { value: "delay" }, "Delay (echo)" ),
		GSUcreateOption( { value: "filter" }, "Filter" ),
	),
] );

GSUsetTemplate( "gsui-effects-fx", () =>
	GSUcreateDiv( { class: "gsuiEffects-fx", draggable: "true" },
		GSUcreateDiv( { class: "gsuiEffects-fx-head" },
			GSUcreateDiv( { class: "gsuiEffects-fx-grip gsuiIcon", "data-icon": "grip-v" } ),
			GSUcreateButton( { class: "gsuiEffects-fx-expand gsuiIcon", "data-icon": "caret-right" } ),
			GSUcreateElement( "gsui-toggle", { title: "Toggle this effect" } ),
			GSUcreateSpan( { class: "gsuiEffects-fx-name" } ),
			GSUcreateButton( { class: "gsuiEffects-fx-remove gsuiIcon", "data-icon": "close", title: "Delete this effect" } ),
		),
		GSUcreateDiv( { class: "gsuiEffects-fx-content" } ),
	)
);
