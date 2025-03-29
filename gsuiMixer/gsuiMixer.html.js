"use strict";

GSUsetTemplate( "gsui-mixer", () =>
	GSUcreateElement( "gsui-panels", { dir: "x" },
		GSUcreateDiv( { class: "gsuiMixer-channels" },
			GSUcreateDiv( { class: "gsuiMixer-head" },
				GSUcreateI( { class: "gsuiMixer-head-icon gsuiIcon", "data-icon": "channels", inert: true } ),
				GSUcreateSpan( { class: "gsuiMixer-head-title", inert: true }, "channels" ),
				GSUcreateElement( "gsui-help-link", { page: "mixer-channels" } ),
				GSUcreateDiv( { class: "gsuiMixer-analyserTypes" },
					GSUcreateI( { class: "gsuiIcon", "data-icon": "waveform" } ),
					GSUcreateDiv( { class: "gsuiMixer-analyserTypes-labels" },
						GSUgetTemplate( "gsui-mixer-analyser-label", "timeDomain" ),
						GSUgetTemplate( "gsui-mixer-analyser-label", "frequency" ),
					),
				),
			),
			GSUcreateElement( "gsui-channels" ),
		),
		GSUcreateDiv( { class: "gsuiMixer-effects" },
			GSUcreateDiv( { class: "gsuiMixer-head" },
				GSUcreateI( { class: "gsuiMixer-head-icon gsuiIcon", "data-icon": "effects", inert: true } ),
				GSUcreateSpan( { class: "gsuiMixer-head-title", inert: true }, "effects" ),
				GSUcreateElement( "gsui-help-link", { page: "mixer-effects" } ),
			),
			GSUcreateElement( "gsui-effects" ),
			GSUcreateDiv( { class: "gsuiMixer-bottomShadow", inert: true } ),
		),
	),
);

GSUsetTemplate( "gsui-mixer-analyser-label", txt =>
	GSUcreateDiv( { class: "gsuiMixer-analyserTypes-label", inert: true },
		GSUcreateI( { class: "gsuiIcon", "data-icon": "radio-btn-checked" } ),
		GSUcreateSpan( null, txt ),
	)
);
