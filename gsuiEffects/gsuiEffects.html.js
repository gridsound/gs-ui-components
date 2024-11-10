"use strict";

GSUsetTemplate( "gsui-effects", () => [
	GSUcreateButton( { class: "gsuiEffects-addBtn", title: "Add an effect" },
		GSUcreateI( { class: "gsuiIcon", "data-icon": "add-effect" } ),
	),
] );
