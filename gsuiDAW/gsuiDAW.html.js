"use strict";

GSUsetTemplate( "gsui-daw", () => [
	GSUcreateDiv( { class: "gsuiDAW-head" },
		GSUcreateDiv( { class: "gsuiDAW-area gsuiDAW-areaUser" },
			GSUcreateSpan( { class: "gsuiDAW-title" }, "GridSound" ),
			GSUcreateAExt( { class: "gsuiDAW-btn", "data-action": "profile", title: "Cloud profile" } ),
			GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "login",  "data-icon": "profile", title: "Login to GridSound" } ),
			GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "logout", "data-icon": "logout",  title: "Logout" } ),
		),
		GSUcreateDiv( { class: "gsuiDAW-area gsuiDAW-areaSave gsuiDAW-btns" },
			GSUcreateButton( { class: "gsuiDAW-btn gsuiDAW-btnColor gsuiDAW-currCmp-saveBtn gsuiIcon", "data-action": "cmp-save", "data-icon": "upload", title: "Save composition" } ),
			GSUcreateButton( { class: "gsuiDAW-btn gsuiDAW-currCmp-editBtn", "data-action": "cmp-rename", title: "Edit composition's title" },
				GSUcreateSpan( { class: "gsuiDAW-currCmp-name" } ),
				GSUcreateI(    { class: "gsuiDAW-currCmp-editIcon gsuiIcon", "data-icon": "pen" } ),
				GSUcreateSpan( { class: "gsuiDAW-currCmp-dur" } ),
			),
		),
		GSUcreateDiv( { class: "gsuiDAW-area gsuiDAW-areaCtrl" },
			GSUcreateDiv( { class: "gsuiDAW-volume", title: "Main app volume (this will not affect the rendering)" },
				GSUcreateElement( "gsui-slider", { "data-action": "volume", type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 150 } ),
			),
			GSUcreateDiv( { class: "gsuiDAW-btns gsuiDAW-playPauseStop" },
				GSUcreateButton( { class: "gsuiDAW-btn gsuiDAW-focusBtn", "data-action": "focusSwitch", "data-dir": "up", title: "Toggle focus between the composition and piano windows" },
					GSUcreateSpan(),
					GSUcreateSpan(),
				),
				GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "play",  "data-icon": "play" } ),
				GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "stop",  "data-icon": "stop" } ),
				GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "reset", "data-icon": "sync", title: "Restart the audio engine" } ),
			),
			GSUcreateElement( "gsui-clock" ),
			GSUcreateElement( "gsui-tempo" ),
		),
		GSUcreateDiv( { class: "gsuiDAW-area gsuiDAW-areaTime" },
			GSUcreateElement( "gsui-slider", { "data-action": "currentTime", type: "linear-x", min: 0, step: .01 } ),
		),
		GSUcreateDiv( { class: "gsuiDAW-area gsuiDAW-areaHist" },
			GSUcreateDiv( { class: "gsuiDAW-btns gsuiDAW-history" },
				GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "undo", "data-icon": "undo", title: "Undo the previous action" } ),
				GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "redo", "data-icon": "redo", title: "Redo the last action" } ),
			),
			GSUcreateElement( "gsui-analyser-hz" ),
			GSUcreateButton( { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiDAW-btnColor gsuiIcon", "data-action": "export",   "data-icon": "export",   title: "Export the composition" } ),
			GSUcreateButton( { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon",                  "data-action": "settings", "data-icon": "settings", title: "Settings" } ),
		),
		GSUcreateDiv( { class: "gsuiDAW-area gsuiDAW-areaWins gsuiDAW-btns" },
			GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "folder-tree", "data-win": "patterns", title: "Open/close the patterns panel", "data-open": true } ),
			GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "mixer",       "data-win": "mixer",    title: "Open/close the mixer window" } ),
			GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "music",       "data-win": "main",     title: "Open/close the composition window" } ),
			GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "oscillator",  "data-win": "synth",    title: "Open/close the synthesizer window" } ),
			GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "drums",       "data-win": "drums",    title: "Open/close the drums window" } ),
			GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "keys",        "data-win": "piano",    title: "Open/close the piano window" } ),
			GSUcreateButton( { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "slices",      "data-win": "slicer",   title: "Open/close the slices window" } ),
		),
		GSUcreateDiv( { class: "gsuiDAW-area gsuiDAW-areaHelp" },
			GSUcreateAExt( { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon", "data-action": "help", "data-icon": "help", title: "Help", href: "https://github.com/gridsound/daw/wiki/help" } ),
			GSUcreateButton( { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon gsuiDAW-btnColor", "data-action": "about", "data-icon": "about", title: "About" } ),
		),
		GSUcreateDiv( { class: "gsuiDAW-area gsuiDAW-areaVers" },
			GSUcreateAExt( { class: "gsuiDAW-btn gsuiDAW-version", "data-action": "version", title: "Access older versions", href: "https://github.com/gridsound/daw/wiki/versions" } ),
			GSUcreateAExt( { class: "gsuiDAW-btn gsuiDAW-changelog gsuiIcon", "data-icon": "changelog", title: "Changelog", href: "https://github.com/gridsound/daw/wiki/changelog" } ),
		),
	),
	GSUcreateElement( "gsui-panels", { class: "gsuiDAW-body", dir: "x" },
		GSUcreateDiv( { class: "gsuiDAW-resources" },
			GSUcreateDiv( { class: "gsuiDAW-libraries" } ),
			GSUcreateDiv( { class: "gsuiDAW-patterns" } ),
		),
		GSUcreateDiv( { class: "gsuiDAW-windows" },
			GSUcreateElement( "gsui-windows" ),
		),
	),
] );
