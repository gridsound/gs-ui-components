"use strict";

GSUI.$setTemplate( "gsui-window", id => [
	GSUI.$createElement( "div", { class: "gsuiWindow-handlers" },
		GSUI.$createElement( "div", { class: "gsuiWindow-handler", "data-dir": "n" } ),
		GSUI.$createElement( "div", { class: "gsuiWindow-handler", "data-dir": "e" } ),
		GSUI.$createElement( "div", { class: "gsuiWindow-handler", "data-dir": "s" } ),
		GSUI.$createElement( "div", { class: "gsuiWindow-handler", "data-dir": "w" } ),
		GSUI.$createElement( "div", { class: "gsuiWindow-handler", "data-dir": "nw" } ),
		GSUI.$createElement( "div", { class: "gsuiWindow-handler", "data-dir": "ne" } ),
		GSUI.$createElement( "div", { class: "gsuiWindow-handler", "data-dir": "sw" } ),
		GSUI.$createElement( "div", { class: "gsuiWindow-handler", "data-dir": "se" } ),
	),
	GSUI.$createElement( "div", { class: "gsuiWindow-wrap" },
		GSUI.$createElement( "div", { class: "gsuiWindow-head" },
			GSUI.$createElement( "button", { class: "gsuiWindow-icon gsuiIcon", tabindex: -1 } ),
			GSUI.$createElement( "div", { class: "gsuiWindow-title" } ),
			GSUI.$createElement( "div", { class: "gsuiWindow-headContent" } ),
			GSUI.$createElement( "div", { class: "gsuiWindow-headBtns" },
				GSUI.$createElement( "button", { class: "gsuiWindow-headBtn gsuiIcon", "data-action": "minimize", "data-icon": "minimize", title: "Minimize" } ),
				GSUI.$createElement( "button", { class: "gsuiWindow-headBtn gsuiIcon", "data-action": "restore", "data-icon": "restore", title: "Restore" } ),
				GSUI.$createElement( "button", { class: "gsuiWindow-headBtn gsuiIcon", "data-action": "maximize", "data-icon": "maximize", title: "Maximize" } ),
				GSUI.$createElement( "button", { class: "gsuiWindow-headBtn gsuiIcon", "data-action": "close", "data-icon": "close", title: "Close" } ),
			),
		),
		GSUI.$createElement( "div", { class: "gsuiWindow-content" } ),
	),
] );
