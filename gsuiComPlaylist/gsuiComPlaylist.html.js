"use strict";

GSUsetTemplate( "gsui-com-playlist", () => [
	GSUcreateDiv( { class: "gsuiComPlaylist-list", "data-list": "cmps" } ),
	GSUcreateDiv( { class: "gsuiComPlaylist-list", "data-list": "bin" } ),
	GSUcreateDiv( { class: "gsuiComPlaylist-placeh", "data-list": "cmps" },
		GSUcreateSpan( { class: "gsuiComPlaylist-placeh-text" },
			GSUcreateSpan( null, "No saved composition yet" ),
			GSUcreateSpan( null, ", you should create a new one right now!" ),
		),
		GSUcreateDiv( { class: "gsuiComPlaylist-placeh-draw" },
			GSUcreateIcon( { icon: "music" } ),
		),
	),
	GSUcreateDiv( { class: "gsuiComPlaylist-placeh", "data-list": "bin" },
		GSUcreateSpan( { class: "gsuiComPlaylist-placeh-text" }, "There is no composition inside your bin." ),
		GSUcreateDiv( { class: "gsuiComPlaylist-placeh-draw" },
			GSUcreateIcon( { icon: "trash" } ),
		),
	),
] );
