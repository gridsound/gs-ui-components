"use strict";

GSUI.$setTemplate( "gsui-clock", () => [
	GSUI.$createElement( "div", { class: "gsuiClock-relative", inert: true },
		GSUI.$createElement( "div", { class: "gsuiClock-absolute" },
			GSUI.$createElement( "div", { class: "gsuiClock-a" }, "0" ),
			GSUI.$createElement( "div", { class: "gsuiClock-b" }, "00" ),
			GSUI.$createElement( "div", { class: "gsuiClock-c" }, "000" ),
			GSUI.$createElement( "span", { class: "gsuiClock-modeText" } ),
		),
	),
	GSUI.$createElement( "button", { class: "gsuiClock-modes" },
		GSUI.$createElement( "div", { class: "gsuiClock-mode gsuiClock-beat" } ),
		GSUI.$createElement( "div", { class: "gsuiClock-mode gsuiClock-second" } ),
	)
] );
