"use strict";

GSUsetTemplate( "gsui-track", () => [
	GSUcreateElement( "gsui-toggle", { title: "toggle track (right click for solo)" } ),
	GSUcreateDiv( { class: "gsuiTrack-nameWrap" },
		GSUcreateInput( { class: "gsuiTrack-name", type: "text", disabled: true, spellcheck: "false" } ),
	),
] );

GSUsetTemplate( "gsui-track-row", () =>
	GSUcreateDiv( { class: "gsuiTrack-row gsui-row" },
		GSUcreateDiv(),
	)
);
