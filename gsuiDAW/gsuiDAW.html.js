"use strict";

GSUI.setTemplate( "gsui-daw", () => [
	GSUI.createElem( "div", { class: "gsuiDAW-head" },
		GSUI.createElem( "div", { class: "gsuiDAW-area gsuiDAW-areaUser" },
			GSUI.createElem( "span",   { class: "gsuiDAW-title" }, "GridSound" ),
			GSUI.createElem( "a",      { class: "gsuiDAW-btn", "data-action": "profile", href: true, title: "Cloud profile", target: "_blank", rel: "noopener" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiDAW-btnBig gsuiIcon", "data-action": "login",  "data-icon": "profile", title: "Login to GridSound" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiDAW-btnBig gsuiIcon", "data-action": "logout", "data-icon": "logout",  title: "Logout" } ),
			GSUI.createElem( "div", { class: "gsuiDAW-cmps" },
				GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiDAW-dropdown-btn gsuiDAW-btnBig gsuiDAW-btnColor gsuiIcon", "data-action": "cmps", "data-icon": "musics", title: "Create cloud/local compositions" } ),
				GSUI.getTemplate( "gsui-daw-cmps" ),
				GSUI.createElem( "div", { class: "gsuiDAW-dropdown-backdrop" } ),
			),
		),
		GSUI.createElem( "div", { class: "gsuiDAW-area gsuiDAW-areaSave gsuiDAW-btns" },
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiDAW-btnColor gsuiDAW-currCmp-saveBtn gsuiIcon", "data-action": "cmp-save", title: "Save composition" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiDAW-currCmp-editBtn", "data-action": "cmp-rename", title: "Edit composition's title" },
				GSUI.createElem( "i",    { class: "gsuiDAW-currCmp-localIcon gsuiIcon" } ),
				GSUI.createElem( "span", { class: "gsuiDAW-currCmp-name" } ),
				GSUI.createElem( "i",    { class: "gsuiDAW-currCmp-editIcon gsuiIcon", "data-icon": "pen" } ),
				GSUI.createElem( "span", { class: "gsuiDAW-currCmp-dur" } ),
			),
		),
		GSUI.createElem( "div", { class: "gsuiDAW-area gsuiDAW-areaCtrl" },
			GSUI.createElem( "div", { class: "gsuiDAW-volume", title: "Main app volume (this will not affect the rendering)" },
				GSUI.createElem( "gsui-slider", { "data-action": "volume", type: "linear-y", min: 0, max: 1, step: .01, "mousemove-size": 150 } ),
			),
			GSUI.createElem( "div", { class: "gsuiDAW-btns gsuiDAW-playPauseStop" },
				GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiDAW-focusBtn", "data-action": "focusSwitch", "data-dir": "up", title: "Toggle focus between the composition and piano windows" },
					GSUI.createElem( "span" ),
					GSUI.createElem( "span" ),
				),
				GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "play",  "data-icon": "play" } ),
				GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "stop",  "data-icon": "stop" } ),
				GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "reset", "data-icon": "sync", title: "Restart the audio engine" } ),
			),
			GSUI.createElem( "gsui-clock" ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiDAW-tempo", "data-action": "tempo", title: "Edit the time signature and BPM" },
				GSUI.createElem( "div", { class: "gsuiDAW-tempo-timeDivision" },
					GSUI.createElem( "span", { class: "gsuiDAW-tempo-beatsPerMeasure" } ),
					GSUI.createElem( "span", { class: "gsuiDAW-tempo-stepsPerBeat" } ),
				),
				GSUI.createElem( "span", { class: "gsuiDAW-tempo-bpm" } ),
			),
		),
		GSUI.createElem( "div", { class: "gsuiDAW-area gsuiDAW-areaTime" },
			GSUI.createElem( "gsui-slider", { "data-action": "currentTime", type: "linear-x", min: 0, step: .01 } ),
		),
		GSUI.createElem( "div", { class: "gsuiDAW-area gsuiDAW-areaHist" },
			GSUI.createElem( "div", { class: "gsuiDAW-btns gsuiDAW-history" },
				GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiIcon",                      "data-action": "undo",     "data-icon": "undo",       title: "Undo the previous action" } ),
				GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiIcon",                      "data-action": "redo",     "data-icon": "redo",       title: "Redo the last action" } ),
				GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiDAW-dropdown-btn gsuiIcon", "data-action": "undoMore", "data-icon": "caret-down", title: "Show the actions list" } ),
				GSUI.getTemplate( "gsui-daw-history" ),
				GSUI.createElem( "div", { class: "gsuiDAW-dropdown-backdrop" } ),
			),
			GSUI.createElem( "gsui-spectrum" ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiDAW-btnColor gsuiIcon", "data-action": "export",   "data-icon": "export",   title: "Export the composition" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon",                  "data-action": "settings", "data-icon": "settings", title: "Settings" } ),
		),
		GSUI.createElem( "div", { class: "gsuiDAW-area gsuiDAW-areaWins gsuiDAW-btns" },
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "folder-tree", "data-win": "blocks",  title: "Open/close the blocks window" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "mixer",       "data-win": "mixer",   title: "Open/close the mixer window" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "music",       "data-win": "main",    title: "Open/close the composition window" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "oscillator",  "data-win": "synth",   title: "Open/close the synthesizer window" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "drums",       "data-win": "drums",   title: "Open/close the drums window" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "keys",        "data-win": "piano",   title: "Open/close the piano window" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "slices",      "data-win": "slicer",  title: "Open/close the slices window" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiIcon", "data-action": "window", "data-icon": "effects",     "data-win": "effects", title: "Open/close the effects window" } ),
		),
		GSUI.createElem( "div", { class: "gsuiDAW-area gsuiDAW-areaHelp" },
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon",                  "data-action": "cookies",   "data-icon": "cookie",    title: "Cookies" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon",                  "data-action": "shortcuts", "data-icon": "keyboard",  title: "Keyboard shortcuts" } ),
			GSUI.createElem( "a",      { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon",                  "data-action": "help",      "data-icon": "help",      title: "Help",      href: "https://github.com/gridsound/daw/wiki/help",      target: "_blank", rel: "noopener" } ),
			GSUI.createElem( "a",      { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon",                  "data-action": "changelog", "data-icon": "changelog", title: "Changelog", href: "https://github.com/gridsound/daw/wiki/changelog", target: "_blank", rel: "noopener" } ),
			GSUI.createElem( "button", { class: "gsuiDAW-btn gsuiDAW-btnBg gsuiIcon gsuiDAW-btnColor", "data-action": "about",     "data-icon": "about",     title: "About" } ),
		),
		GSUI.createElem( "div", { class: "gsuiDAW-area gsuiDAW-areaVers" },
			GSUI.createElem( "a", { class: "gsuiDAW-btn gsuiDAW-version", "data-action": "version", title: "Access older versions", href: "https://github.com/gridsound/daw/wiki/versions", target: "_blank", rel: "noopener" },
				GSUI.createElem( "i", { class: "gsuiIcon", "data-icon": "list" } ),
				GSUI.createElem( "span", { class: "gsuiDAW-version-num" } ),
			),
		),
	),
	GSUI.createElem( "div", { class: "gsuiDAW-body" } ),
] );

GSUI.setTemplate( "gsui-daw-cmps", () =>
	GSUI.createElem( "div", { class: "gsuiDAW-dropdown", tabindex: 0 },
		GSUI.createElem( "div", { class: "gsuiDAW-dropdown-head", "data-list": "local" },
			GSUI.createElem( "i", { class: "gsuiDAW-dropdown-icon gsuiIcon", "data-icon": "local" } ),
			GSUI.createElem( "span", { class: "gsuiDAW-dropdown-title" }, "local" ),
			GSUI.getTemplate( "gsui-daw-cmps-btn", { action: "localNewCmp", icon: "plus", text: "new", title: "Create a new composition on this computer" } ),
			GSUI.getTemplate( "gsui-daw-cmps-btn", { action: "localOpenCmp", icon: "folder-open", text: "open", title: "Open a composition on this computer" } ),
		),
		GSUI.createElem( "div", { class: "gsuiDAW-dropdown-head", "data-list": "cloud" },
			GSUI.createElem( "i", { class: "gsuiDAW-dropdown-icon gsuiIcon", "data-icon": "cloud" } ),
			GSUI.createElem( "span", { class: "gsuiDAW-dropdown-title" }, "cloud" ),
			GSUI.getTemplate( "gsui-daw-cmps-btn", { action: "cloudNewCmp", icon: "plus", text: "new", title: "Create a new composition on your cloud profile" } ),
		),
		GSUI.createElem( "div", { class: "gsuiDAW-dropdown-list", "data-list": "local" },
			GSUI.createElem( "div", { class: "gsuiDAW-dropdown-placeholder" },
				GSUI.createElem( "span", null, "there is no local composition here" ),
			),
		),
		GSUI.createElem( "div", { class: "gsuiDAW-dropdown-list", "data-list": "cloud" },
			GSUI.createElem( "div", { class: "gsuiDAW-dropdown-placeholder" },
				GSUI.createElem( "span", null, "you don't have any cloud composition yet" ),
				GSUI.createElem( "span", null, "you are not connected" ),
			),
		),
	)
);

GSUI.setTemplate( "gsui-daw-cmps-btn", ( { action, title, icon, text } ) =>
	GSUI.createElem( "button", { class: "gsuiDAW-cmps-btn", "data-action": action, title },
		GSUI.createElem( "i", { class: "gsuiDAW-cmps-btn-icon gsuiIcon", "data-icon": icon } ),
		GSUI.createElem( "span", { class: "gsuiDAW-cmps-btn-text" }, text ),
	)
);

GSUI.setTemplate( "gsui-daw-cmp", ( { id, saveMode } ) =>
	GSUI.createElem( "div", { class: "gsuiDAW-cmp", "data-id": id, draggable: "true", tabindex: 0 },
		GSUI.createElem( "button", { class: "gsuiDAW-cmp-btn gsuiIcon", "data-action": "cmp-save", "data-icon": saveMode === "local" ? "save" : "upload" } ),
		GSUI.createElem( "a", { href: true, class: "gsuiDAW-cmp-info", "data-action": "cmp-open" },
			GSUI.createElem( "div", { class: "gsuiDAW-cmp-name" } ),
			GSUI.createElem( "div", null,
				GSUI.createElem( "span", { class: "gsuiDAW-cmp-duration-wrap" },
					GSUI.createElem( "i", { class: "gsuiIcon", "data-icon": "clock" } ),
					GSUI.createElem( "span", { class: "gsuiDAW-cmp-duration" } ),
				),
				GSUI.createElem( "span", { class: "gsuiDAW-cmp-bpm-wrap" },
					GSUI.createElem( "i", { class: "gsuiIcon", "data-icon": "speed" } ),
					GSUI.createElem( "span", { class: "gsuiDAW-cmp-bpm" } ),
				),
			),
		),
		GSUI.createElem( "a", { href: true, class: "gsuiDAW-cmp-btn gsuiDAW-cmp-btn-light gsuiIcon", "data-action": "cmp-json",   "data-icon": "file-export", title: "Export to JSON file" } ),
		GSUI.createElem( "button", {        class: "gsuiDAW-cmp-btn gsuiDAW-cmp-btn-light gsuiIcon", "data-action": "cmp-delete", "data-icon": "minus-oct", title: "Delete" } ),
	)
);

GSUI.setTemplate( "gsui-daw-history", () =>
	GSUI.createElem( "div", { class: "gsuiDAW-dropdown", tabindex: 0 },
		GSUI.createElem( "div", { class: "gsuiDAW-dropdown-head" },
			GSUI.createElem( "i", { class: "gsuiDAW-dropdown-icon gsuiIcon", "data-icon": "history" } ),
			GSUI.createElem( "span", { class: "gsuiDAW-dropdown-title" }, "history" ),
		),
		GSUI.createElem( "div", { class: "gsuiDAW-dropdown-list" },
			GSUI.createElem( "div", { class: "gsuiDAW-dropdown-placeholder" },
				GSUI.createElem( "span", null, "there is nothing to undo" ),
			),
		),
	)
);

GSUI.setTemplate( "gsui-daw-history-action", ( { icon, desc, index } ) =>
	GSUI.createElem( "div", { class: "gsuiDAW-history-action", "data-action": "historyAction", "data-index": index },
		GSUI.createElem( "i", { class: "gsuiDAW-history-action-icon gsuiIcon", "data-icon": icon } ),
		GSUI.createElem( "span", { class: "gsuiDAW-history-action-text" }, desc ),
	)
);
