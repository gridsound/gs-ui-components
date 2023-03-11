"use strict";

GSUI.$setTemplate( "gsui-track", () => [
	GSUI.$createElement( "gsui-toggle", { title: "toggle track (right click for solo)" } ),
	GSUI.$createElement( "div", { class: "gsuiTrack-nameWrap" },
		GSUI.$createElement( "input", { class: "gsuiTrack-name", type: "text", disabled: true, spellcheck: "false" } ),
	),
] );

GSUI.$setTemplate( "gsui-track-row", () =>
	GSUI.$createElement( "div", { class: "gsuiTrack-row gsui-row" },
		GSUI.$createElement( "div" ),
	)
);
