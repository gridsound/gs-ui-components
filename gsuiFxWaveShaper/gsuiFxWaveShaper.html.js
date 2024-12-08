"use strict";

GSUsetTemplate( "gsui-fx-waveshaper", () => [
	GSUcreateDiv( { class: "gsuiFxWaveShaper-params" },
		GSUcreateDiv( { class: "gsuiFxWaveShaper-symmetry" },
			GSUcreateElement( "gsui-toggle", { off: true, "data-prop": "symmetry" } ),
			GSUcreateSpan( { class: "gsuiEffect-param-label" }, "symm" ),
		),
		GSUcreateDiv( { class: "gsuiFxWaveShaper-oversample" },
			GSUcreateElement( "gsui-toggle", { off: true, "data-prop": "oversample" } ),
			GSUcreateSpan( { class: "gsuiEffect-param-label" }, "oversmp" ),
			GSUcreateSelect( { class: "gsuiEffect-param-value" },
				GSUcreateOption( { value: "2x" } ),
				GSUcreateOption( { value: "4x" } ),
			),
		),
		GSUcreateButton( { class: "gsuiFxWaveShaper-reset gsuiEffect-param-value" }, "reset" ),
	),
	GSUcreateDiv( { class: "gsuiFxWaveShaper-in" },
		GSUcreateDiv( { class: "gsuiFxWaveShaper-side-graph" },
			GSUcreateDiv( { class: "gsuiFxWaveShaper-graph" },
				GSUcreateElementSVG( "svg", { class: "gsuiFxWaveShaper-graph-diag", preserveAspectRatio: "none", inert: true },
					GSUcreateElementSVG( "line" ),
				),
				GSUcreateDiv( { class: "gsuiFxWaveShaper-graph-x", inert: true } ),
				GSUcreateDiv( { class: "gsuiFxWaveShaper-graph-y", inert: true } ),
				GSUcreateDiv( { class: "gsuiFxWaveShaper-graph-unit gsuiFxWaveShaper-graph-x-plus", inert: true } ),
				GSUcreateDiv( { class: "gsuiFxWaveShaper-graph-unit gsuiFxWaveShaper-graph-x-minus", inert: true } ),
				GSUcreateDiv( { class: "gsuiFxWaveShaper-graph-unit gsuiFxWaveShaper-graph-y-plus", inert: true } ),
				GSUcreateDiv( { class: "gsuiFxWaveShaper-graph-unit gsuiFxWaveShaper-graph-y-minus", inert: true } ),
				GSUcreateElement( "gsui-dotline", { viewbox: "-1 -1 1 1", xstep: .01, ystep: .01 } ),
			),
		),
		GSUcreateDiv( { class: "gsuiFxWaveShaper-side-waves" },
			GSUcreateElementSVG( "svg", { class: "gsuiFxWaveShaper-waves", preserveAspectRatio: "none", inert: true },
				GSUcreateElementSVG( "polyline", { class: "gsuiFxWaveShaper-waveA" } ),
				GSUcreateElementSVG( "polyline", { class: "gsuiFxWaveShaper-waveB" } ),
			),
		),
	),
] );
