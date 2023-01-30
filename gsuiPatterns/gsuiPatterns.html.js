"use strict";

GSUI.$setTemplate( "gsui-patterns", () =>
	GSUI.$createElement( "gsui-panels", { class: "gsuiPanels-y" },
		GSUI.$getTemplate( "gsui-patterns-panel", {
			class: "Buffers",
			title: "buffers",
			icon: "waveform",
			placeholder: "drag 'n drop raw files here (mp3, ogg, wav)",
		} ),
		GSUI.$getTemplate( "gsui-patterns-panel", {
			class: "Slices",
			title: "slices",
			icon: "slices",
			placeholder: "no slices yet",
			button: { action: "newSlices", title: "Create a new slices pattern" },
		} ),
		GSUI.$getTemplate( "gsui-patterns-panel", {
			class: "Drums",
			title: "drums",
			icon: "drums",
			placeholder: "no drums yet",
			button: { action: "newDrums", title: "Create a new drums pattern" },
		} ),
		GSUI.$getTemplate( "gsui-patterns-panel", {
			class: "Keys",
			title: "keys",
			icon: "oscillator",
			placeholder: "no synth yet",
			button: { action: "newSynth", title: "Create a new synthesizer" },
		} ),
	)
);

GSUI.$setTemplate( "gsui-patterns-panel", obj =>
	GSUI.$createElement( "div", { class: `gsuiPatterns-panel gsuiPatterns-panel${ obj.class }` },
		GSUI.$createElement( "div", { class: "gsuiPatterns-panel-menu" },
			GSUI.$createElement( "i", { class: "gsuiPatterns-panel-icon gsuiIcon", "data-icon": obj.icon } ),
			GSUI.$createElement( "span", { class: "gsuiPatterns-panel-title" }, obj.title ),
			obj.button &&
				GSUI.$createElement( "button", { class: "gsuiPatterns-btnSolid", "data-action": obj.button.action, title: obj.button.title },
					GSUI.$createElement( "i", { class: "gsuiPatterns-btnIcon gsuiIcon", "data-icon": "plus" } ),
				),
		),
		GSUI.$createElement( "div", { class: "gsuiPatterns-panel-list-wrap" },
			GSUI.$createElement( "div", { class: "gsuiPatterns-placeholderToCheck gsuiPatterns-panel-list" } ),
			GSUI.$createElement( "div", { class: "gsuiPatterns-placeholder" },
				GSUI.$createElement( "span", null, obj.placeholder ),
			),
		),
	)
);
