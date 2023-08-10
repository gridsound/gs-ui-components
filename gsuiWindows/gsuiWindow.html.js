"use strict";

GSUsetTemplate( "gsui-window", id => [
	GSUcreateElement( "div", { class: "gsuiWindow-handlers" },
		GSUcreateElement( "div", { class: "gsuiWindow-handler", "data-dir": "n" } ),
		GSUcreateElement( "div", { class: "gsuiWindow-handler", "data-dir": "e" } ),
		GSUcreateElement( "div", { class: "gsuiWindow-handler", "data-dir": "s" } ),
		GSUcreateElement( "div", { class: "gsuiWindow-handler", "data-dir": "w" } ),
		GSUcreateElement( "div", { class: "gsuiWindow-handler", "data-dir": "nw" } ),
		GSUcreateElement( "div", { class: "gsuiWindow-handler", "data-dir": "ne" } ),
		GSUcreateElement( "div", { class: "gsuiWindow-handler", "data-dir": "sw" } ),
		GSUcreateElement( "div", { class: "gsuiWindow-handler", "data-dir": "se" } ),
	),
	GSUcreateElement( "div", { class: "gsuiWindow-wrap" },
		GSUcreateElement( "div", { class: "gsuiWindow-head" },
			GSUcreateElement( "button", { class: "gsuiWindow-icon gsuiIcon", tabindex: -1 } ),
			GSUcreateElement( "div", { class: "gsuiWindow-name" } ),
			GSUcreateElement( "div", { class: "gsuiWindow-headContent" } ),
			GSUcreateElement( "div", { class: "gsuiWindow-headBtns" },
				GSUcreateElement( "button", { class: "gsuiWindow-headBtn gsuiIcon", "data-action": "minimize", "data-icon": "minimize", title: "Minimize" } ),
				GSUcreateElement( "button", { class: "gsuiWindow-headBtn", "data-action": "restore", title: "Restore" },
					GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "restore", inert: true } ),
					GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "compress", inert: true } ),
				),
				GSUcreateElement( "button", { class: "gsuiWindow-headBtn", "data-action": "maximize", title: "Maximize" },
					GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "maximize", inert: true } ),
					GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "expand", inert: true } ),
				),
				GSUcreateElement( "button", { class: "gsuiWindow-headBtn gsuiIcon", "data-action": "close", "data-icon": "close", title: "Close" } ),
			),
		),
		GSUcreateElement( "div", { class: "gsuiWindow-content" } ),
	),
] );
