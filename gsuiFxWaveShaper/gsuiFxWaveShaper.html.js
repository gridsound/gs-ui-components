"use strict";

GSUsetTemplate( "gsui-fx-waveshaper", () => (
	GSUcreateDiv( { class: "gsuiFxWaveShaper-in" },
		GSUcreateDiv( { class: "gsuiFxWaveShaper-side-graph" },
			GSUcreateDiv( { class: "gsuiFxWaveShaper-graph" },
				GSUcreateElementSVG( "svg", { class: "gsuiFxWaveShaper-graph-diag", preserveAspectRatio: "none" },
					GSUcreateElementSVG( "line" ),
				),
				GSUcreateDiv( { class: "gsuiFxWaveShaper-graph-x" } ),
				GSUcreateDiv( { class: "gsuiFxWaveShaper-graph-y" } ),
				GSUcreateElement( "gsui-dotline", { viewbox: "-1 -1 1 1", xstep: .05, ystep: .05 } ),
			),
		),
		GSUcreateDiv( { class: "gsuiFxWaveShaper-side-waves" },
			GSUcreateSpan( { class: "gsuiFxWaveShaper-waves-title" }, "visualisation" ),
			GSUcreateElementSVG( "svg", { class: "gsuiFxWaveShaper-waves", preserveAspectRatio: "none" },
				GSUcreateElementSVG( "polyline", { class: "gsuiFxWaveShaper-waveA" } ),
				GSUcreateElementSVG( "polyline", { class: "gsuiFxWaveShaper-waveB" } ),
			),
		),
	)
) );
