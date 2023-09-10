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
	GSUcreateDiv( { class: `gsuiPatterns-panel gsuiPatterns-panel${ obj.class }` },
		GSUcreateDiv( { class: "gsuiPatterns-panel-menu" },
			GSUcreateI( { class: "gsuiPatterns-panel-icon gsuiIcon", "data-icon": obj.icon } ),
			GSUcreateSpan( { class: "gsuiPatterns-panel-title" }, obj.title ),
			obj.button &&
				GSUcreateButton( { class: "gsuiPatterns-btnSolid", "data-action": obj.button.action, title: obj.button.title },
					GSUcreateI( { class: "gsuiPatterns-btnIcon gsuiIcon", "data-icon": "plus" } ),
				),
		),
		GSUcreateDiv( { class: "gsuiPatterns-panel-list-wrap" },
			GSUcreateDiv( { class: "gsuiPatterns-placeholderToCheck gsuiPatterns-panel-list" } ),
			GSUcreateDiv( { class: "gsuiPatterns-placeholder", inert: true },
				GSUcreateSpan( null, obj.placeholder ),
			),
		),
	)
);
