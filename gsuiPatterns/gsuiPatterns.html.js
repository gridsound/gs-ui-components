"use strict";

GSUI.setTemplate( "gsui-patterns", () =>
	GSUI.createElem( "gsui-panels", { class: "gsuiPanels-y" },
		GSUI.getTemplate( "gsui-patterns-panel", {
			class: "Buffers",
			title: "buffers",
			icon: "waveform",
			placeholder: "drag 'n drop raw files here (mp3, ogg, wav)",
		} ),
		GSUI.getTemplate( "gsui-patterns-panel", {
			class: "Slices",
			title: "slices",
			icon: "slices",
			placeholder: "no slices yet",
			button: { action: "newSlices", title: "Create a new slices pattern", txt: "new slices" },
		} ),
		GSUI.getTemplate( "gsui-patterns-panel", {
			class: "Drums",
			title: "drums",
			icon: "drums",
			placeholder: "no drums yet",
			button: { action: "newDrums", title: "Create a new drums pattern", txt: "new drums" },
		} ),
		GSUI.getTemplate( "gsui-patterns-panel", {
			class: "Keys",
			title: "keys",
			icon: "oscillator",
			placeholder: "no synth yet",
			button: { action: "newSynth", title: "Create a new synthesizer", txt: "new synth" },
		} ),
	)
);

GSUI.setTemplate( "gsui-patterns-panel", obj =>
	GSUI.createElem( "div", { class: `gsuiPatterns-panel gsuiPatterns-panel${ obj.class }` },
		GSUI.createElem( "div", { class: "gsuiPatterns-panel-menu" },
			GSUI.createElem( "i", { class: "gsuiPatterns-panel-icon gsuiIcon", "data-icon": obj.icon } ),
			GSUI.createElem( "span", { class: "gsuiPatterns-panel-title" }, obj.title ),
			obj.button &&
				GSUI.createElem( "button", { class: "gsuiPatterns-btnSolid", "data-action": obj.button.action, title: obj.button.title },
					GSUI.createElem( "i", { class: "gsuiPatterns-btnIcon gsuiIcon", "data-icon": "plus" } ),
					GSUI.createElem( "span", { class: "gsuiPatterns-btnText" }, obj.button.txt ),
				),
		),
		GSUI.createElem( "div", { class: "gsuiPatterns-placeholderToCheck gsuiPatterns-panel-list" } ),
		GSUI.createElem( "div", { class: "gsuiPatterns-placeholder" },
			GSUI.createElem( "span", null, obj.placeholder ),
		),
	)
);
