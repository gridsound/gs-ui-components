"use strict";

GSUsetTemplate( "gsui-mixer", () =>
	GSUcreateElement( "gsui-panels", { dir: "x" },
		GSUcreateDiv( { class: "gsuiMixer-channels" },
			GSUcreateDiv( { class: "gsuiMixer-head" },
				GSUcreateI( { class: "gsuiMixer-head-icon gsuiIcon", "data-icon": "channels", inert: true } ),
				GSUcreateSpan( { class: "gsuiMixer-head-title", inert: true }, "channels" ),
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
			GSUcreateDiv( { class: "gsuiMixer-head", inert: true },
				GSUcreateI( { class: "gsuiMixer-head-icon gsuiIcon", "data-icon": "effects" } ),
				GSUcreateSpan( { class: "gsuiMixer-head-title" }, "effects" ),
			),
			GSUcreateElement( "gsui-effects" ),
			GSUcreateDiv( { class: "gsuiMixer-bottomShadow", inert: true } ),
		),
	),
);

GSUsetTemplate( "gsui-mixer-analyser-label", txt =>
	GSUcreateDiv( { class: "gsuiMixer-analyserTypes-label", inert: true },
		GSUcreateI( { class: "gsuiIcon", "data-icon": "dot-circle" } ),
		GSUcreateSpan( null, txt ),
	)
);
