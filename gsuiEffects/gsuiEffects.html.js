"use strict";

GSUsetTemplate( "gsui-effects", () => [
	GSUcreateButton( { class: "gsuiEffects-addBtn", title: "Add an effect" },
		GSUcreateI( { class: "gsuiIcon", "data-icon": "add-effect" } ),
	),
	GSUcreateSelect( { class: "gsuiEffects-addSelect", size: 3 },
		GSUcreateOption( { value: "delay" }, "Delay (echo)" ),
		GSUcreateOption( { value: "filter" }, "Filter" ),
		GSUcreateOption( { value: "waveshaper" }, "WaveShaper" ),
	),
] );
