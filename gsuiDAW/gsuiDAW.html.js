"use strict";

GSUI.setTemplate( "gsui-daw", () => [
	GSUI.createElement( "div", { class: "gsuiDAW-head" },
		GSUI.createElement( "div", { class: "gsuiDAW-area gsuiDAW-areaUser" },
			GSUI.createElement( "span",   { class: "gsuiDAW-title" }, "GridSound" ),
			GSUI.createElement( "a",      { class: "gsuiDAW-btn", "data-action": "profile", href: true, title: "Cloud profile", target: "_blank", rel: "noopener" } ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiDAW-btnBig gsuiIcon", "data-action": "login",  "data-icon": "profile", title: "Login to GridSound" } ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiDAW-btnBig gsuiIcon", "data-action": "logout", "data-icon": "logout",  title: "Logout" } ),
			GSUI.createElement( "div", { class: "gsuiDAW-cmps" },
				GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiDAW-dropdown-btn gsuiDAW-btnBig gsuiDAW-btnColor gsuiIcon", "data-action": "cmps", "data-icon": "musics", title: "Create cloud/local compositions" } ),
				GSUI.getTemplate( "gsui-daw-cmps" ),
				GSUI.createElement( "div", { class: "gsuiDAW-dropdown-backdrop" } ),
			),
		),
		GSUI.createElement( "div", { class: "gsuiDAW-area gsuiDAW-areaSave gsuiDAW-btns" },
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiDAW-btnColor gsuiDAW-currCmp-saveBtn gsuiIcon", "data-action": "saveCurrent", title: "Save composition" } ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiDAW-currCmp-editBtn", "data-action": "rename", title: "Edit composition's title" },
				GSUI.createElement( "i",    { class: "gsuiDAW-currCmp-localIcon gsuiIcon" } ),
				GSUI.createElement( "span", { class: "gsuiDAW-currCmp-name" } ),
				GSUI.createElement( "i",    { class: "gsuiDAW-currCmp-editIcon gsuiIcon", "data-icon": "pen" } ),
				GSUI.createElement( "span", { class: "gsuiDAW-currCmp-dur" }, "0:45" ),
			),
		),
		GSUI.createElement( "div", { class: "gsuiDAW-area gsuiDAW-areaCtrl" },
			GSUI.createElement( "div", { class: "gsuiDAW-volume", title: "Main app volume (this will not affect the rendering)" },
				GSUI.createElement( "gsui-slider", { "data-action": "volume", type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 150 } ),
			),
			GSUI.createElement( "div", { class: "gsuiDAW-btns gsuiDAW-playPauseStop" },
				GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiDAW-focusBtn", "data-action": "focusSwitch", "data-dir": "up", title: "Toggle focus between the composition and piano windows" },
					GSUI.createElement( "span" ),
					GSUI.createElement( "span" ),
				),
				GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "play",  "data-icon": "play" } ),
				GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "stop",  "data-icon": "stop" } ),
				GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "reset", "data-icon": "sync", title: "Restart the audio engine" } ),
			),
			GSUI.createElement( "gsui-clock" ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiDAW-tempo", "data-action": "tempo", title: "Edit the time signature and BPM" },
				GSUI.createElement( "div", { class: "gsuiDAW-tempo-timeDivision" },
					GSUI.createElement( "span", { class: "gsuiDAW-tempo-beatsPerMeasure" } ),
					GSUI.createElement( "span", { class: "gsuiDAW-tempo-stepsPerBeat" } ),
				),
				GSUI.createElement( "span", { class: "gsuiDAW-tempo-bpm" } ),
			),
		),
		GSUI.createElement( "div", { class: "gsuiDAW-area gsuiDAW-areaTime" },
			GSUI.createElement( "gsui-slider", { "data-action": "currentTime", type: "linear-x", min: 0, step: .01 } ),
		),
		GSUI.createElement( "div", { class: "gsuiDAW-area gsuiDAW-areaHist" },
			GSUI.createElement( "div", { class: "gsuiDAW-btns gsuiDAW-history" },
				GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiIcon",                      "data-action": "undo",     "data-icon": "undo",       title: "Undo the previous action" } ),
				GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiIcon",                      "data-action": "redo",     "data-icon": "redo",       title: "Redo the last action" } ),
				GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiDAW-dropdown-btn gsuiIcon", "data-action": "undoMore", "data-icon": "caret-down", title: "Show the actions list" } ),
				GSUI.getTemplate( "gsui-daw-history" ),
				GSUI.createElement( "div", { class: "gsuiDAW-dropdown-backdrop" } ),
			),
			GSUI.createElement( "gsui-spectrum" ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiDAW-btnColor gsuiIcon", "data-action": "export",   "data-icon": "export",   title: "Export the composition" } ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon",                  "data-action": "settings", "data-icon": "settings", title: "Settings" } ),
		),
		GSUI.createElement( "div", { class: "gsuiDAW-area gsuiDAW-areaWins gsuiDAW-btns" },
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiIcon", "data-icon": "folder-tree", "data-win": "blocks",  title: "Open/close the blocks window" } ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiIcon", "data-icon": "mixer",       "data-win": "mixer",   title: "Open/close the mixer window" } ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiIcon", "data-icon": "music",       "data-win": "main",    title: "Open/close the composition window" } ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiIcon", "data-icon": "oscillator",  "data-win": "synth",   title: "Open/close the synthesizer window" } ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiIcon", "data-icon": "drums",       "data-win": "drums",   title: "Open/close the drums window" } ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiIcon", "data-icon": "keys",        "data-win": "piano",   title: "Open/close the piano window" } ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiIcon", "data-icon": "slices",      "data-win": "slicer",  title: "Open/close the slices window" } ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiIcon", "data-icon": "effects",     "data-win": "effects", title: "Open/close the effects window" } ),
		),
		GSUI.createElement( "div", { class: "gsuiDAW-area gsuiDAW-areaHelp" },
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon",                  "data-action": "cookies",   "data-icon": "cookie",    title: "Cookies" } ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon",                  "data-action": "keyboard",  "data-icon": "keyboard",  title: "Keyboard shortcuts" } ),
			GSUI.createElement( "a",      { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon",                  "data-action": "help",      "data-icon": "help",      title: "Help",      href: "https://github.com/gridsound/daw/wiki/help",      target: "_blank", rel: "noopener" } ),
			GSUI.createElement( "a",      { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon",                  "data-action": "changelog", "data-icon": "changelog", title: "Changelog", href: "https://github.com/gridsound/daw/wiki/changelog", target: "_blank", rel: "noopener" } ),
			GSUI.createElement( "button", { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon gsuiDAW-btnColor", "data-action": "about",     "data-icon": "about",     title: "About" } ),
		),
		GSUI.createElement( "div", { class: "gsuiDAW-area gsuiDAW-areaVers" },
			GSUI.createElement( "a", { class: "gsuiDAW-btn gsuiDAW-version", "data-action": "version", title: "Access older versions", href: "https://github.com/gridsound/daw/wiki/versions", target: "_blank", rel: "noopener" },
				GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "list" } ),
				GSUI.createElement( "span", { class: "gsuiDAW-version-num" }, "version" ),
			),
		),
	),
	GSUI.createElement( "div", { class: "gsuiDAW-body" } ),
] );

GSUI.setTemplate( "gsui-daw-cmps", () => (
	GSUI.createElement( "div", { class: "gsuiDAW-dropdown", tabindex: 0 },
		GSUI.createElement( "div", { class: "gsuiDAW-dropdown-head", "data-list": "local" },
			GSUI.createElement( "i", { class: "gsuiDAW-dropdown-icon gsuiIcon", "data-icon": "local" } ),
			GSUI.createElement( "span", { class: "gsuiDAW-dropdown-title" }, "local" ),
			GSUI.getTemplate( "gsui-daw-cmps-btn", { action: "localNewCmp", icon: "plus", text: "new", title: "Create a new composition on this computer" } ),
			GSUI.getTemplate( "gsui-daw-cmps-btn", { action: "localOpenCmp", icon: "folder-open", text: "open", title: "Open a composition on this computer" } ),
		),
		GSUI.createElement( "div", { class: "gsuiDAW-dropdown-head", "data-list": "cloud" },
			GSUI.createElement( "i", { class: "gsuiDAW-dropdown-icon gsuiIcon", "data-icon": "cloud" } ),
			GSUI.createElement( "span", { class: "gsuiDAW-dropdown-title" }, "cloud" ),
			GSUI.getTemplate( "gsui-daw-cmps-btn", { action: "cloudNewCmp", icon: "plus", text: "new", title: "Create a new composition on your cloud profile" } ),
		),
		GSUI.createElement( "div", { class: "gsuiDAW-dropdown-list", "data-list": "local" },
			GSUI.createElement( "div", { class: "gsuiDAW-dropdown-placeholder" },
				GSUI.createElement( "span", null, "there is no local composition here" ),
			),
		),
		GSUI.createElement( "div", { class: "gsuiDAW-dropdown-list", "data-list": "cloud" },
			GSUI.createElement( "div", { class: "gsuiDAW-dropdown-placeholder" },
				GSUI.createElement( "span", null, "you don't have any cloud composition yet" ),
				GSUI.createElement( "span", null, "you are not connected" ),
			),
		),
	)
) );

GSUI.setTemplate( "gsui-daw-cmps-btn", ( { action, title, icon, text } ) => (
	GSUI.createElement( "button", { class: "gsuiDAW-cmps-btn", "data-action": action, title },
		GSUI.createElement( "i", { class: "gsuiDAW-cmps-btn-icon gsuiIcon", "data-icon": icon } ),
		GSUI.createElement( "span", { class: "gsuiDAW-cmps-btn-text" }, text ),
	)
) );

GSUI.setTemplate( "gsui-daw-cmp", ( { id, saveMode } ) => (
	GSUI.createElement( "div", { class: "gsuiDAW-cmp", "data-id": id, draggable: "true", tabindex: 0 },
		GSUI.createElement( "button", { class: "gsuiDAW-cmp-btn gsuiIcon", "data-action": "save", "data-icon": saveMode === "local" ? "save" : "upload" } ),
		GSUI.createElement( "a", { href: true, class: "gsuiDAW-cmp-info", "data-action": "open" },
			GSUI.createElement( "div", { class: "gsuiDAW-cmp-name" } ),
			GSUI.createElement( "div", null,
				GSUI.createElement( "span", { class: "gsuiDAW-cmp-duration-wrap" },
					GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "clock" } ),
					GSUI.createElement( "span", { class: "gsuiDAW-cmp-duration" } ),
				),
				GSUI.createElement( "span", { class: "gsuiDAW-cmp-bpm-wrap" },
					GSUI.createElement( "i", { class: "gsuiIcon", "data-icon": "speed" } ),
					GSUI.createElement( "span", { class: "gsuiDAW-cmp-bpm" } ),
				),
			),
		),
		GSUI.createElement( "a", { href: true, class: "gsuiDAW-cmp-btn gsuiDAW-cmp-btn-light gsuiIcon", "data-action": "json",   "data-icon": "file-export", title: "Export to JSON file" } ),
		GSUI.createElement( "button", {        class: "gsuiDAW-cmp-btn gsuiDAW-cmp-btn-light gsuiIcon", "data-action": "delete", "data-icon": "minus-oct", title: "Delete" } ),
	)
) );

GSUI.setTemplate( "gsui-daw-history", () => (
	GSUI.createElement( "div", { class: "gsuiDAW-dropdown", tabindex: 0 },
		GSUI.createElement( "div", { class: "gsuiDAW-dropdown-head" },
			GSUI.createElement( "i", { class: "gsuiDAW-dropdown-icon gsuiIcon", "data-icon": "history" } ),
			GSUI.createElement( "span", { class: "gsuiDAW-dropdown-title" }, "history" ),
		),
		GSUI.createElement( "div", { class: "gsuiDAW-dropdown-list" },
			GSUI.createElement( "div", { class: "gsuiDAW-dropdown-placeholder" },
				GSUI.createElement( "span", null, "there is nothing to undo" ),
			),
		),
	)
) );

GSUI.setTemplate( "gsui-daw-history-action", ( { icon, desc } ) => (
	GSUI.createElement( "div", { class: "gsuiDAW-history-action" },
		GSUI.createElement( "i", { class: "gsuiDAW-history-action-icon gsuiIcon", "data-icon": icon } ),
		GSUI.createElement( "span", { class: "gsuiDAW-history-action-text" }, desc ),
	)
) );
