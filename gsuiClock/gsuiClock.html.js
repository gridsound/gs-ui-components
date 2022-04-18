"use strict";

GSUI.setTemplate( "gsui-clock", () => [
	GSUI.createElem( "div", { class: "gsuiClock-relative" },
		GSUI.createElem( "div", { class: "gsuiClock-absolute" },
			GSUI.createElem( "div", { class: "gsuiClock-a" }, "0" ),
			GSUI.createElem( "div", { class: "gsuiClock-b" }, "00" ),
			GSUI.createElem( "div", { class: "gsuiClock-c" }, "000" ),
			GSUI.createElem( "span", { class: "gsuiClock-modeText" } ),
		),
	),
	GSUI.createElem( "button", { class: "gsuiClock-modes" },
		GSUI.createElem( "div", { class: "gsuiClock-mode gsuiClock-beat" } ),
		GSUI.createElem( "div", { class: "gsuiClock-mode gsuiClock-second" } ),
	)
] );
