"use strict";

GSUsetTemplate( "gsui-patterns", () =>
	GSUcreateElement( "gsui-panels", { dir: "y" },
		GSUgetTemplate( "gsui-patterns-panel", {
			class: "Buffers",
			title: "buffers",
			icon: "waveform",
			placeholder: "drag 'n drop raw files here (mp3, ogg, wav)",
		} ),
		GSUgetTemplate( "gsui-patterns-panel", {
			class: "Slices",
			title: "slices",
			icon: "slices",
			placeholder: "no slices yet",
			button: { action: "newSlices", title: "Create a new slices pattern" },
		} ),
		GSUgetTemplate( "gsui-patterns-panel", {
			class: "Drums",
			title: "drums",
			icon: "drums",
			placeholder: "no drums yet",
			button: { action: "newDrums", title: "Create a new drums pattern" },
		} ),
		GSUgetTemplate( "gsui-patterns-panel", {
			class: "Keys",
			title: "keys",
			icon: "oscillator",
			placeholder: "no synth yet",
			button: { action: "newSynth", title: "Create a new synthesizer" },
		} ),
	)
);

GSUsetTemplate( "gsui-patterns-panel", obj =>
	GSUcreateElement( "div", { class: `gsuiPatterns-panel gsuiPatterns-panel${ obj.class }` },
		GSUcreateElement( "div", { class: "gsuiPatterns-panel-menu" },
			GSUcreateElement( "i", { class: "gsuiPatterns-panel-icon gsuiIcon", "data-icon": obj.icon } ),
			GSUcreateElement( "span", { class: "gsuiPatterns-panel-title" }, obj.title ),
			obj.button &&
				GSUcreateButton( { class: "gsuiPatterns-btnSolid", "data-action": obj.button.action, title: obj.button.title },
					GSUcreateElement( "i", { class: "gsuiPatterns-btnIcon gsuiIcon", "data-icon": "plus" } ),
				),
		),
		GSUcreateElement( "div", { class: "gsuiPatterns-panel-list-wrap" },
			GSUcreateElement( "div", { class: "gsuiPatterns-placeholderToCheck gsuiPatterns-panel-list" } ),
			GSUcreateElement( "div", { class: "gsuiPatterns-placeholder", inert: true },
				GSUcreateElement( "span", null, obj.placeholder ),
			),
		),
	)
);
