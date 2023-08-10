"use strict";

GSUsetTemplate( "gsui-track", () => [
	GSUcreateElement( "gsui-toggle", { title: "toggle track (right click for solo)" } ),
	GSUcreateElement( "div", { class: "gsuiTrack-nameWrap" },
		GSUcreateElement( "input", { class: "gsuiTrack-name", type: "text", disabled: true, spellcheck: "false" } ),
	),
] );

GSUsetTemplate( "gsui-track-row", () =>
	GSUcreateElement( "div", { class: "gsuiTrack-row gsui-row" },
		GSUcreateElement( "div" ),
	)
);
