"use strict";

GSUsetTemplate( "gsui-patterns", () =>
	GSUcreateElement( "gsui-panels", { dir: "y" },
		GSUgetTemplate( "gsui-patterns-panel", {
			type: "buffers",
			title: "buffers",
			icon: "cu-waveform",
			placeholder: "drag 'n drop raw files here (mp3, ogg, wav)",
		} ),
		GSUgetTemplate( "gsui-patterns-panel", {
			type: "slices",
			title: "slices",
			icon: "slices",
			placeholder: "no slices yet",
			button: { action: "newSlices", title: "Create a new slices pattern" },
		} ),
		GSUgetTemplate( "gsui-patterns-panel", {
			type: "drums",
			title: "drums",
			icon: "cu-drums",
			placeholder: "no drums yet",
			button: { action: "newDrums", title: "Create a new drums pattern" },
		} ),
		GSUgetTemplate( "gsui-patterns-panel", {
			type: "keys",
			title: "keys",
			icon: "oscillator",
			placeholder: "no synth yet",
			button: { action: "newSynth", title: "Create a new synthesizer" },
		} ),
	)
);

GSUsetTemplate( "gsui-patterns-panel", obj =>
	GSUcreateDiv( { class: "gsuiPatterns-panel", "data-type": obj.type },
		GSUcreateDiv( { class: "gsuiPatterns-panel-menu" },
			GSUcreateIcon( { class: "gsuiPatterns-panel-icon", icon: obj.icon } ),
			GSUcreateSpan( { class: "gsuiPatterns-panel-title" }, obj.title ),
			obj.button && GSUcreateButton( { class: "gsuiPatterns-btnSolid", "data-action": obj.button.action, title: obj.button.title },
				GSUcreateIcon( { class: "gsuiPatterns-btnIcon", icon: "plus" } ),
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
