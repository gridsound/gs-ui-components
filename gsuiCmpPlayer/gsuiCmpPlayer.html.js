"use strict";

GSUsetTemplate( "gsui-cmp-player", () => [
	GSUcreateButton( { class: "gsuiCmpPlayer-btn gsuiCmpPlayer-play gsuiIcon", "data-icon": "play" } ),
	GSUcreateDiv( { class: "gsuiCmpPlayer-body" },
		GSUcreateDiv( { class: "gsuiCmpPlayer-text" },
			GSUcreateDiv( { class: "gsuiCmpPlayer-name" },
				GSUcreateA( { class: "gsuiCmpPlayer-nameLink", href: false } ),
			),
			GSUcreateDiv( { class: "gsuiCmpPlayer-info-wrap" },
				GSUcreateDiv( { class: "gsuiCmpPlayer-info" },
					GSUcreateDiv( { class: "gsuiCmpPlayer-time" },
						GSUcreateI( { class: "gsuiIcon", "data-icon": "clock" } ),
						GSUcreateSpan( { class: "gsuiCmpPlayer-currentTime" } ),
						GSUcreateSpan( { class: "gsuiCmpPlayer-duration" } ),
					),
					GSUcreateDiv( { class: "gsuiCmpPlayer-tempo" },
						GSUcreateI( { class: "gsuiIcon", "data-icon": "speed" } ),
						GSUcreateSpan( { class: "gsuiCmpPlayer-bpm" } ),
					),
				),
			),
		),
		GSUcreateDiv( { class: "gsuiCmpPlayer-slider" },
			GSUcreateDiv( { class: "gsuiCmpPlayer-sliderValue" } ),
			GSUcreateDiv( { class: "gsuiCmpPlayer-sliderInput" } ),
		),
	),
	GSUcreateAExt( { class: "gsuiCmpPlayer-btn gsuiCmpPlayer-edit", title: "Open in the DAW" },
		GSUcreateI( { class: "gsuiIcon", "data-icon": "music" } ),
		GSUcreateI( { class: "gsuiIcon", "data-icon": "pen" } ),
	),
] );
