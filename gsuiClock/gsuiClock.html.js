"use strict";

GSUsetTemplate( "gsui-clock", () => [
	GSUcreateDiv( { class: "gsuiClock-relative", inert: true },
		GSUcreateDiv( { class: "gsuiClock-absolute" },
			GSUcreateDiv( { class: "gsuiClock-a" }, "0" ),
			GSUcreateDiv( { class: "gsuiClock-b" }, "00" ),
			GSUcreateDiv( { class: "gsuiClock-c" }, "000" ),
			GSUcreateSpan( { class: "gsuiClock-modeText" } ),
		),
	),
	GSUcreateButton( { class: "gsuiClock-modes" },
		GSUcreateDiv( { class: "gsuiClock-mode gsuiClock-beat" } ),
		GSUcreateDiv( { class: "gsuiClock-mode gsuiClock-second" } ),
	)
] );
