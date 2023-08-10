"use strict";

GSUsetTemplate( "gsui-clock", () => [
	GSUcreateElement( "div", { class: "gsuiClock-relative", inert: true },
		GSUcreateElement( "div", { class: "gsuiClock-absolute" },
			GSUcreateElement( "div", { class: "gsuiClock-a" }, "0" ),
			GSUcreateElement( "div", { class: "gsuiClock-b" }, "00" ),
			GSUcreateElement( "div", { class: "gsuiClock-c" }, "000" ),
			GSUcreateElement( "span", { class: "gsuiClock-modeText" } ),
		),
	),
	GSUcreateElement( "button", { class: "gsuiClock-modes" },
		GSUcreateElement( "div", { class: "gsuiClock-mode gsuiClock-beat" } ),
		GSUcreateElement( "div", { class: "gsuiClock-mode gsuiClock-second" } ),
	)
] );
